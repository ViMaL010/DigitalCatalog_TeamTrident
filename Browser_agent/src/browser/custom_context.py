import logging
from typing import Optional

from browser_use.browser.context import BrowserContext, BrowserContextConfig, BrowserContextState

logger = logging.getLogger(__name__)


class CustomBrowserContext(BrowserContext):
    def __init__(
        self,
        browser,
        config: BrowserContextConfig | None = None,
        state: Optional[BrowserContextState] = None,
    ):
        super(CustomBrowserContext, self).__init__(browser=browser, config=config, state=state)
        self._context = None  # Will be injected from CustomBrowser
        self._page = None     # Will be lazily created

    async def get_page(self):
        if not self._context:
            raise RuntimeError("Playwright context not set on CustomBrowserContext")
        if not self._page:
            self._page = await self._context.new_page()
        return self._page
