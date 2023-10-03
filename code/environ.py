import os
def get_run_environment():
    return os.environ.get("RunEnvironment", "prod")