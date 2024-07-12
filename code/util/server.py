from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig
cors_config = CORSConfig(allow_origin="https://resumes.acm.illinois.edu", extra_origins=["http://localhost:5173"], max_age=300, allow_credentials=True, allow_headers=["authorization"])
app = APIGatewayRestResolver(cors=cors_config)