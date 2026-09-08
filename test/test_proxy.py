import asyncio
import sys
import time
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from proxy import forward_data


@pytest.mark.asyncio
async def test_latency_is_applied():
    config = {
        "latency_seconds": 0.5,
        "timeout_seconds": 3,
        "bandwidth_kbps": 0
    }

    async def echo_handler(reader, writer):
        try:
            while True:
                data = await reader.read(4096)

                if not data:
                    break

                writer.write(data)
                await writer.drain()
        finally:
            writer.close()
            await writer.wait_closed()

    server = await asyncio.start_server(
        echo_handler,
        "127.0.0.1",
        0
    )

    port = server.sockets[0].getsockname()[1]

    source_reader, source_writer = await asyncio.open_connection(
        "127.0.0.1",
        port
    )

    destination_reader, destination_writer = await asyncio.open_connection(
        "127.0.0.1",
        port
    )

    forward_task = asyncio.create_task(
        forward_data(
            source_reader,
            destination_writer,
            "CLIENT → SERVER",
            config
        )
    )

    start = time.perf_counter()

    source_writer.write(b"hello")
    await source_writer.drain()

    response = await destination_reader.read(4096)

    elapsed = time.perf_counter() - start

    assert response == b"hello"
    assert elapsed >= 0.5

    forward_task.cancel()

    await asyncio.gather(
        forward_task,
        return_exceptions=True
    )

    source_writer.close()
    destination_writer.close()

    await source_writer.wait_closed()
    await destination_writer.wait_closed()

    server.close()
    await server.wait_closed()


@pytest.mark.asyncio
async def test_connection_drop():
    config = {
        "drop_connection": True
    }

    async def handle_client(reader, writer):
        writer.close()
        await writer.wait_closed()

    server = await asyncio.start_server(
        handle_client,
        "127.0.0.1",
        0
    )

    port = server.sockets[0].getsockname()[1]

    reader, writer = await asyncio.open_connection(
        "127.0.0.1",
        port
    )

    data = await reader.read(4096)

    assert data == b""

    writer.close()
    await writer.wait_closed()

    server.close()
    await server.wait_closed()


@pytest.mark.asyncio
async def test_timeout():
    config = {
        "latency_seconds": 0,
        "timeout_seconds": 0.5,
        "bandwidth_kbps": 0
    }

    async def silent_handler(reader, writer):
        await asyncio.sleep(2)

        writer.close()
        await writer.wait_closed()

    server = await asyncio.start_server(
        silent_handler,
        "127.0.0.1",
        0
    )

    port = server.sockets[0].getsockname()[1]

    reader, writer = await asyncio.open_connection(
        "127.0.0.1",
        port
    )

    result = await forward_data(
        reader,
        writer,
        "TEST",
        config
    )

    assert result == "timeout"

    writer.close()
    await writer.wait_closed()

    server.close()
    await server.wait_closed()


@pytest.mark.asyncio
async def test_multiple_clients():
    config = {
        "latency_seconds": 0,
        "timeout_seconds": 3,
        "bandwidth_kbps": 0
    }

    async def echo_handler(reader, writer):
        try:
            while True:
                data = await reader.read(4096)

                if not data:
                    break

                writer.write(data)
                await writer.drain()
        finally:
            writer.close()
            await writer.wait_closed()

    server = await asyncio.start_server(
        echo_handler,
        "127.0.0.1",
        0
    )

    server_port = server.sockets[0].getsockname()[1]

    async def run_client(message):
        reader, writer = await asyncio.open_connection(
            "127.0.0.1",
            server_port
        )

        forward_task = asyncio.create_task(
            forward_data(
                reader,
                writer,
                "CLIENT",
                config
            )
        )

        writer.write(message)
        await writer.drain()

        response = await reader.read(4096)

        forward_task.cancel()

        await asyncio.gather(
            forward_task,
            return_exceptions=True
        )

        writer.close()
        await writer.wait_closed()

        return response

    responses = await asyncio.gather(
        run_client(b"client one"),
        run_client(b"client two"),
        run_client(b"client three")
    )

    assert responses == [
        b"client one",
        b"client two",
        b"client three"
    ]

    server.close()
    await server.wait_closed()


@pytest.mark.asyncio
async def test_bandwidth_limit():
    config = {
        "latency_seconds": 0,
        "timeout_seconds": 5,
        "bandwidth_kbps": 1
    }

    async def echo_handler(reader, writer):
        data = b""

        while len(data) < 2048:
            chunk = await reader.read(4096)

            if not chunk:
                break

            data += chunk

        writer.write(data)
        await writer.drain()

        writer.close()
        await writer.wait_closed()

    server = await asyncio.start_server(
        echo_handler,
        "127.0.0.1",
        0
    )

    server_port = server.sockets[0].getsockname()[1]

    source_reader, source_writer = await asyncio.open_connection(
        "127.0.0.1",
        server_port
    )

    destination_reader, destination_writer = await asyncio.open_connection(
        "127.0.0.1",
        server_port
    )

    forward_task = asyncio.create_task(
        forward_data(
            source_reader,
            destination_writer,
            "TEST",
            config
        )
    )

    data = b"A" * 2048

    start = time.perf_counter()

    source_writer.write(data)
    await source_writer.drain()

    response = b""

    while len(response) < len(data):
        chunk = await destination_reader.read(4096)

        if not chunk:
            break

        response += chunk

    elapsed = time.perf_counter() - start

    assert response == data
    assert elapsed >= 1.0

    forward_task.cancel()

    await asyncio.gather(
        forward_task,
        return_exceptions=True
    )

    source_writer.close()
    destination_writer.close()

    await source_writer.wait_closed()
    await destination_writer.wait_closed()

    server.close()
    await server.wait_closed()