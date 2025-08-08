import json
from openai import OpenAI

from .logging import get_logger
from .oai_prompts import system_prompt
logger = get_logger()

LENGTH_LIMIT = 30000

def get_oai_client(oai_api_key):
    return OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=oai_api_key,
)

def oai_get_profile_json(client, resume_text, role_type, role_description):
    if len(resume_text) > LENGTH_LIMIT:
        raise ValueError(f"Resume is {len(resume_text)} characters long, limit is {LENGTH_LIMIT}")
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": resume_text,
            },
            {
                "role": "user",
                "content": f"I am interested in {role_type} role for jobs involving {role_description}.",
            }
        ],
        model="openai/gpt-5-nano",
        temperature=0.8,
        n=1,
        max_tokens=8192,
    )
    result = chat_completion.choices[0]
    finish_reason = result.finish_reason
    logger.info(f"""
Performed OpenAI call to generate profile 
Finish reason: {finish_reason}
Total Tokens: {chat_completion.usage.total_tokens} 
Completion Tokens: {chat_completion.usage.completion_tokens}
Prompt Tokens: {chat_completion.usage.prompt_tokens}
OpenAI ID: {chat_completion.id})
""")
    return json.loads(result.message.content)
