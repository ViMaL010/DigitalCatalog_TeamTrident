# src/agent/session_context.py

class SessionContext:
    def __init__(self):
        self.domain = None
        self.last_page_title = None
        self.command_history = []

    def update(self, command: str, url: str = None, title: str = None):
        self.command_history.append(command)
        if url:
            self.domain = url.split("/")[2] if "://" in url else url
        if title:
            self.last_page_title = title

    def to_prompt(self):
        return f"""
You're a helpful voice-based browser assistant.

Current domain: {self.domain or 'unknown'}
Last page title: {self.last_page_title or 'unknown'}
Command history: {self.command_history[-3:]}

Understand and act on the next instruction accordingly.
"""
