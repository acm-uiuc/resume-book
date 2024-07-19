import json
from openai import OpenAI
from oai_prompts import system_prompt

LENGTH_LIMIT = 30000

def get_oai_client(oai_api_key):
    return OpenAI(
    # This is the default and can be omitted
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
        model="gpt-4o-mini",
        temperature=0.8,
        n=1,
        max_tokens=8192
    )
    result = chat_completion.choices[0]
    return json.loads(result.message.content)