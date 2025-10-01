import boto3
from decouple import config
from botocore.exceptions import NoCredentialsError


def get_boto3_client(
    service_name: str,
):
    is_local = config("ENVIRONMENT", default=None) == "local"
    aws_region = config("AWS_REGION", default="us-east-1")

    try:
        if is_local:
            service_client = boto3.client(
                service_name,
                region_name=aws_region,
                aws_access_key_id="test",
                aws_secret_access_key="test",
                endpoint_url="http://localstack:4566",
            )
        else:
            aws_access_key_id = config("AWS_ACCESS_KEY_ID", default=None)
            aws_secret_access_key = config("AWS_SECRET_ACCESS_KEY", default=None)
            service_client = boto3.client(
                service_name,
                region_name=aws_region,
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
            )

        return service_client
    except NoCredentialsError:
        print("AWS credentials not found")
        raise
