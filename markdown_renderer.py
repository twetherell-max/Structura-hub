from abc import ABC, abstractmethod

class BaseMarkdownRenderer(ABC):
    @abstractmethod
    def render(self, markdown_string: str) -> str:
        pass

class CommonMarkRenderer(BaseMarkdownRenderer):
    def render(self, markdown_string: str) -> str:
        # In a real implementation, you would use a library like `markdown-it-py`
        # or `commonmark.py` here. For this example, we'll just do a basic
        # conversion.
        return f"<p>{markdown_string.replace('  ', '<br/>').replace('# ', '<h1>')}</p>"
