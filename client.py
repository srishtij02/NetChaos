import asyncio
import time


async def main():
    reader, writer = await asyncio.open_connection(
        "127.0.0.1",
        9000
    )

    print("Connected to NetChaos!")
    print("Type 'exit' to close the connection.")

    while True:
        message = input("Enter a message: ")

        if message.lower() == "exit":
            break

        start_time = time.perf_counter()

        writer.write(message.encode())
        await writer.drain()

        data = await reader.read(1024)

        end_time = time.perf_counter()

        print("Server replied:", data.decode())
        print(f"Response time: {end_time - start_time:.2f} seconds")

    writer.close()
    await writer.wait_closed()

    print("Connection closed.")


asyncio.run(main())