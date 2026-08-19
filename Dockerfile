FROM nousresearch/hermes-agent:latest

ENV HERMES_HOME=/opt/data
ENV HERMES_DASHBOARD=1
ENV HERMES_DASHBOARD_HOST=0.0.0.0
ENV HERMES_DASHBOARD_PORT=8080
ENV HERMES_DASHBOARD_BASIC_AUTH_USERNAME=admin
ENV PORT=8080

EXPOSE 8080

# The official s6 supervisor keeps both the gateway and dashboard alive.
CMD ["gateway","run"]
