FROM docker.io/nousresearch/hermes-agent:v2026.8.18

ENV HERMES_HOME=/opt/data
ENV HERMES_DASHBOARD_BASIC_AUTH_USERNAME=admin
ENV PORT=8080

EXPOSE 8080

# Keep the dashboard available while the always-on gateway retries until setup is complete.
# Generate a stable dashboard signing secret inside the Hermes data directory.
CMD ["/bin/bash","-lc","set -e; mkdir -p \"${HERMES_HOME:-/opt/data}\"; secret_file=\"${HERMES_HOME:-/opt/data}/.dashboard-auth-secret\"; if [ -z \"${HERMES_DASHBOARD_BASIC_AUTH_SECRET:-}\" ]; then if [ ! -s \"$secret_file\" ]; then umask 077; python -c \"import secrets; print(secrets.token_hex(32))\" > \"$secret_file\"; fi; export HERMES_DASHBOARD_BASIC_AUTH_SECRET=\"$(cat \"$secret_file\")\"; fi; (while true; do hermes gateway run --replace || true; sleep 10; done) & exec hermes dashboard --host 0.0.0.0 --port \"${PORT:-8080}\" --no-open"]
