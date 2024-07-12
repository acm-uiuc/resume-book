from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig, Response, content_types
cors_config = CORSConfig(allow_origin="https://resumes.acm.illinois.edu", extra_origins=["http://localhost:5173"], max_age=300, allow_credentials=True, allow_headers=["authorization"])
app = APIGatewayRestResolver(cors=cors_config)

@app.get("/api/v1/healthz")
def healthz():
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "UP"})