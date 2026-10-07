# Shared Vercel Deployment Governor

TravAI no longer creates a Vercel deployment for every Git commit.

Normal production releases are now coordinated by the Edgeforce V139 team deployment governor. The governor coalesces rapid commits, enforces a shared rolling deployment budget, and uses TravAI's existing linked Git source to deploy the latest `main` branch when capacity is available.

This keeps rapid local/runtime development from consuming the shared Vercel Hobby-plan deployment allowance one commit at a time.
