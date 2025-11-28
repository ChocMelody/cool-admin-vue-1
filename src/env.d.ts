/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_REQUIRE_CAPTCHA: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
