import asyncio


async def handle_client(reader, writer):
    while True:
        data = await reader.read(1024)

        if not data:
            break

        message = data.decode()
        print(f"Server received: {message}")

        writer.write(data)
        await writer.drain()

    writer.close()
    await writer.wait_closed()


async def main():
    server = await asyncio.start_server(
        handle_client,
        "127.0.0.1",
        8001
    )

    print("Test server running on port 8001")

    async with server:
        await server.serve_forever()


asyncio.run(main())