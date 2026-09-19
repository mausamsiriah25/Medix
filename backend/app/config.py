from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://medix_user:changeme@localhost:3306/medix"
    secret_key: str = "change-this-in-.env"
    access_token_expire_minutes: int = 60 * 12
    cors_origins: list[str] = ["http://localhost:5173"]
    tax_rate: float = 0.05

    class Config:
        env_file = ".env"

settings = Settings()
