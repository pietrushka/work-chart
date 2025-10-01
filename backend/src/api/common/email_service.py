from botocore.exceptions import ClientError
from decouple import config
from typing import List, Optional
from .boto3_factory import get_boto3_client


class EmailService:
    def __init__(self):
        self.aws_region = config("AWS_REGION", default=None)
        self.from_email = config("FROM_EMAIL", default=None)

        self.ses_client = get_boto3_client("ses")

    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None,
    ) -> bool:
        try:
            destination = {
                "ToAddresses": to_emails,
            }

            if cc_emails:
                destination["CcAddresses"] = cc_emails

            if bcc_emails:
                destination["BccAddresses"] = bcc_emails

            message = {
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": body_text, "Charset": "UTF-8"}},
            }

            if body_html:
                message["Body"]["Html"] = {"Data": body_html, "Charset": "UTF-8"}

            response = self.ses_client.send_email(
                Source=self.from_email, Destination=destination, Message=message
            )

            print(f"Email sent successfully. Message ID: {response['MessageId']}")
            return True

        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            error_message = e.response["Error"]["Message"]
            print(f"Failed to send email. Error: {error_code} - {error_message}")
            return False
        except Exception as e:
            print(f"Unexpected error sending email: {str(e)}")
            return False


email_service = EmailService()
