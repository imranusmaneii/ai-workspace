import random
import string
import httpx
from app.core.config import get_settings

settings = get_settings()


async def send_verification_email(email: str, code: str) -> bool:
    if not settings.RESEND_API_KEY:
        print(f"[DEV] Verification code for {email}: {code}")
        return True

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.EMAIL_FROM,
                "to": [email],
                "subject": "Your Noir AI Verification Code",
                "html": f"""
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #111;">Noir AI</h2>
                    <p>Your verification code is:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0;">{code}</div>
                    <p style="color: #666; font-size: 14px;">This code expires in 15 minutes. If you didn't create an account, you can ignore this email.</p>
                </div>
                """,
            },
        )
        return resp.status_code == 200


def generate_code() -> str:
    return "".join(random.choices(string.digits, k=6))
