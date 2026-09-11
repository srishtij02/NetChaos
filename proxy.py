
import asyncio
import json
from pathlib import Path


CONFIG_PATH = Path(__file__).parent / "config.json"
METRICS_PATH = Path(__file__).parent / "metrics.json"


metrics = {
    "active_connections": 0,
    "total_connections": 0,
    "dropped_connections": 0,
    "timeouts": 0,
    "connection_errors": 0,
    "bytes_client_to_server": 0,
    "bytes_server_to_client": 0,
}


def load_config():
    with open(CONFIG_PATH, "r") as file:
        return json.load(file)


def save_metrics():
    with open(METRICS_PATH, "w") as file:
        json.dump(metrics, file, indent=4)


async def send_with_bandwidth_limit(writer, data, config):
    bandwidth_kbps = config["bandwidth_kbps"]

    if bandwidth_kbps <= 0:
        writer.write(data)
        await writer.drain()
        return

    bytes_per_second = bandwidth_kbps * 1024
    chunk_size = 1024

    for start in range(0, len(data), chunk_size):
        chunk = data[start:start + chunk_size]

        writer.write(chunk)
        await writer.drain()

        delay = len(chunk) / bytes_per_second
        await asyncio.sleep(delay)


async def forward_data(
    source_reader,
    destination_writer,
    direction,
    config
):
    timeout = config["timeout_seconds"]

    try:
        while True:
            try:
                data = await asyncio.wait_for(
                    source_reader.read(4096),
                    timeout=timeout
                )

            except asyncio.TimeoutError:
                print(
                    f"{direction}: no data received "
                    f"for {timeout} seconds."
                )

                return "timeout"

            if not data:
                return "closed"

            print(
                f"{direction}: {len(data)} bytes"
            )

            if direction == "CLIENT → SERVER":
                metrics["bytes_client_to_server"] += len(data)
            else:
                metrics["bytes_server_to_client"] += len(data)

            save_metrics()

            latency = config["latency_seconds"]

            if latency > 0:
                print(
                    f"{direction}: adding "
                    f"{latency} seconds latency"
                )

                await asyncio.sleep(latency)

            await send_with_bandwidth_limit(
                destination_writer,
                data,
                config
            )

    except (ConnectionResetError, BrokenPipeError):
        print(
            f"{direction}: connection closed."
        )

        return "closed"


async def handle_client(
    client_reader,
    client_writer,
    config
):
    client_address = client_writer.get_extra_info(
        "peername"
    )

    print(
        f"Client connected: {client_address}"
    )

    metrics["total_connections"] += 1
    metrics["active_connections"] += 1
    save_metrics()

    if config["drop_connection"]:
        metrics["dropped_connections"] += 1
        metrics["active_connections"] -= 1
        save_metrics()

        print(
            "Dropping connection intentionally."
        )

        client_writer.close()
        await client_writer.wait_closed()
        return

    if config["reset_connection"]:
        metrics["connection_errors"] += 1
        metrics["active_connections"] -= 1
        save_metrics()

        print(
            "Resetting connection intentionally."
        )

        client_writer.transport.abort()
        return

    try:
        server_reader, server_writer = await asyncio.open_connection(
            config["upstream_host"],
            config["upstream_port"]
        )

    except ConnectionRefusedError:
        metrics["connection_errors"] += 1
        metrics["active_connections"] -= 1
        save_metrics()

        print(
            "Could not connect to the upstream server."
        )

        error_message = (
            "ERROR: Could not connect to upstream server."
        )

        client_writer.write(
            error_message.encode()
        )
        await client_writer.drain()

        client_writer.close()
        await client_writer.wait_closed()
        return

    print(
        "Connected to upstream server."
    )

    client_to_server = asyncio.create_task(
        forward_data(
            client_reader,
            server_writer,
            "CLIENT → SERVER",
            config
        )
    )

    server_to_client = asyncio.create_task(
        forward_data(
            server_reader,
            client_writer,
            "SERVER → CLIENT",
            config
        )
    )

    done, pending = await asyncio.wait(
        [
            client_to_server,
            server_to_client
        ],
        return_when=asyncio.FIRST_COMPLETED
    )

    timeout_occurred = False

    for task in done:
        try:
            result = task.result()

            if result == "timeout":
                metrics["timeouts"] += 1
                timeout_occurred = True

        except Exception:
            pass

    if timeout_occurred:
        save_metrics()

        error_message = (
            "ERROR: Connection timed out due to inactivity."
        )

        try:
            client_writer.write(
                error_message.encode()
            )
            await client_writer.drain()
        except Exception:
            pass

    for task in pending:
        task.cancel()

    await asyncio.gather(
        *pending,
        return_exceptions=True
    )

    try:
        server_writer.close()
        await server_writer.wait_closed()
    except Exception:
        pass

    try:
        client_writer.close()
        await client_writer.wait_closed()
    except Exception:
        pass

    metrics["active_connections"] -= 1
    save_metrics()

    print(
        f"Client disconnected: {client_address}"
    )


async def main():
    config = load_config()

    save_metrics()

    async def client_handler(reader, writer):
        await handle_client(
            reader,
            writer,
            config
        )

    proxy = await asyncio.start_server(
        client_handler,
        config["listen_host"],
        config["listen_port"]
    )

    print(
        f"NetChaos proxy running on "
        f"{config['listen_host']}:"
        f"{config['listen_port']}"
    )

    async with proxy:
        await proxy.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
 
