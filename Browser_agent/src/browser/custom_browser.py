import asyncio
import socket
import logging

from playwright.async_api import async_playwright, Browser as PlaywrightBrowser
from browser_use.browser.browser import Browser, IN_DOCKER
from browser_use.browser.context import BrowserContextConfig
from browser_use.browser.utils.screen_resolution import get_screen_resolution, get_window_adjustments
from browser_use.browser.chrome import (
    CHROME_ARGS,
    CHROME_DETERMINISTIC_RENDERING_ARGS,
    CHROME_DISABLE_SECURITY_ARGS,
    CHROME_DOCKER_ARGS,
    CHROME_HEADLESS_ARGS,
)
from .custom_context import CustomBrowserContext

logger = logging.getLogger(__name__)


class CustomBrowser(Browser):

    async def new_context(self, config: BrowserContextConfig | None = None) -> CustomBrowserContext:
        """Create a browser context and pass Playwright context into CustomBrowserContext"""
        browser_config = self.config.model_dump() if self.config else {}
        context_config = config.model_dump() if config else {}
        merged_config = {**browser_config, **context_config}
        context_config_obj = BrowserContextConfig(**merged_config)

        # ✅ Launch Playwright browser if not already done
        if not hasattr(self, "_playwright_browser"):
            playwright = await async_playwright().start()
            self._playwright_browser = await self._setup_builtin_browser(playwright)

        # ✅ Create a Playwright context (actual browser tab context)
        playwright_context = await self._playwright_browser.new_context(
            viewport={
                "width": context_config_obj.window_width,
                "height": context_config_obj.window_height
            }
        )

        # ✅ Inject that context into CustomBrowserContext
        custom_context = CustomBrowserContext(config=context_config_obj, browser=self)
        custom_context._context = playwright_context  # <-- Make it available in get_page
        return custom_context

    async def _setup_builtin_browser(self, playwright) -> PlaywrightBrowser:
        assert self.config.browser_binary_path is None, \
            'browser_binary_path should be None if trying to use the builtin browsers'

        if (
            not self.config.headless and
            hasattr(self.config, 'new_context_config') and
            hasattr(self.config.new_context_config, 'window_width') and
            hasattr(self.config.new_context_config, 'window_height')
        ):
            screen_size = {
                'width': self.config.new_context_config.window_width,
                'height': self.config.new_context_config.window_height,
            }
            offset_x, offset_y = get_window_adjustments()
        elif self.config.headless:
            screen_size = {'width': 1920, 'height': 1080}
            offset_x, offset_y = 0, 0
        else:
            screen_size = get_screen_resolution()
            offset_x, offset_y = get_window_adjustments()

        chrome_args = {
            f'--remote-debugging-port={self.config.chrome_remote_debugging_port}',
            *CHROME_ARGS,
            *(CHROME_DOCKER_ARGS if IN_DOCKER else []),
            *(CHROME_HEADLESS_ARGS if self.config.headless else []),
            *(CHROME_DISABLE_SECURITY_ARGS if self.config.disable_security else []),
            *(CHROME_DETERMINISTIC_RENDERING_ARGS if self.config.deterministic_rendering else []),
            f'--window-position={offset_x},{offset_y}',
            f'--window-size={screen_size["width"]},{screen_size["height"]}',
            *self.config.extra_browser_args,
        }

        # If port already used, remove remote debugging flag
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', self.config.chrome_remote_debugging_port)) == 0:
                chrome_args.remove(f'--remote-debugging-port={self.config.chrome_remote_debugging_port}')

        browser_class = getattr(playwright, self.config.browser_class)
        args = {
            'chromium': list(chrome_args),
            'firefox': ['-no-remote', *self.config.extra_browser_args],
            'webkit': ['--no-startup-window', *self.config.extra_browser_args],
        }

        return await browser_class.launch(
            channel='chromium',
            headless=self.config.headless,
            args=args[self.config.browser_class],
            proxy=self.config.proxy.model_dump() if self.config.proxy else None,
            handle_sigterm=False,
            handle_sigint=False,
        )
