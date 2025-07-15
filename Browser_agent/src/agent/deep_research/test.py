import asyncio
from formmanage import ask_user

async def main():
    # Single prompt
    result = await ask_user("What would you like me to do?")
    print("You said:", result)

    # Multi-field
    # fields = "name: What is your name?\nemail: What is your email?"
    # result = await ask_user(fields)
    # print(result)

asyncio.run(main())
