FROM mysql:8.0
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=mobci
ENV MYSQL_USER=mobci_user
ENV MYSQL_PASSWORD=mobci_password
COPY init.sql /docker-entrypoint-initdb.d/init.sql
EXPOSE 3306
