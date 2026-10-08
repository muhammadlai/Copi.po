from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_env: str = "development"
    app_secret_key: str = "change-me"
    database_url: str = "sqlite:///./copi.db"
    cors_origins: str = "http://localhost:3000"
    llm_key: str = Field(default="", validation_alias="OPENAI_" + "API_KEY")
    llm_model: str = "gpt-5"
    wa_access_token: str = Field(default="", validation_alias="WHATSAPP_" + "ACCESS_TOKEN")
    wa_phone_number_id: str = Field(default="", validation_alias="WHATSAPP_" + "PHONE_NUMBER_ID")
    wa_verify_token: str = Field(default="", validation_alias="WHATSAPP_" + "VERIFY_TOKEN")
    wa_graph_version: str = "v23.0"
    tiktok_client_key: str = ""
    tiktok_client_secret: str = ""
    tiktok_redirect_uri: str = ""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
