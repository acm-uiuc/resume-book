# Feature #6 - Upload files

**Priority** High | Medium | Low

## Objective

> As **[the actor]**, I want **[the something]** so I can **[the goal]**. <!-- This is the format to follow -->

As a user, I want to be able to upload a pdf of my resume so it can be viewed by recruiters.

## Acceptance Criteria

- It’s done when... <!-- Criteria should always begin with this  -->
- It’s done when a file can be drag and dropped on client
- It’s done when the file can be uploaded to the bucket
- It’s done when the backend returns a presigned url

## Tasks Outline

### Backend

- Create a `GET` endpoint at `/api/v1/student/getUploadURL`
- Endpoint should return presigned-url to upload doc
- Endpoint should also return expiration
- Server should validate file type and size
- Update docs

### Frontend

- Add drag and drop upload to registration flow
- Add drag and drop upload to edit profile flow
- Client should validate file type and size

## Additional requirements (optional)

<!-- Reference: https://medium.com/@Carmichaelize/writing-better-user-stories-and-bug-tickets-3cb5165e7db -->
