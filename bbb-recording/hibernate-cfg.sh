#!/bin/bash
. .env

echo "Generating Hibernate configuration"

PERSISTENCE_DIR=./bbb-recording-persistence/src/main/resources
CFG_FILE=hibernate.cfg.xml

mkdir -p ${PERSISTENCE_DIR}

CONTENT=`echo '<!DOCTYPE hibernate-configuration PUBLIC "-//Hibernate/Hibernate Configuration DTD 3.0//EN" "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
  <session-factory>
    <!-- JDBC Database connection settings -->
    <property name="connection.driver_class">org.postgresql.Driver</property>
    <property name="connection.url">jdbc:postgresql://localhost:'"$HOST_PORT"'/bbb</property>
    <property name="connection.username">'"$POSTGRES_USER"'</property>
    <property name="connection.password">'"$POSTGRES_PASSWORD"'</property>
          
    <!-- JDBC connection pool settings -->
    <property name="hibernate.connection.provider_class">com.zaxxer.hikari.hibernate.HikariConnectionProvider</property>
    <property name="hibernate.hikari.minimumIdle">5</property>
    <property name="hibernate.hikari.maximumPoolSize">10</property>
    <property name="hibernate.hikari.idleTimeout">30000</property>
    
    <!-- Select our SQL dialect -->
    <property name="dialect">org.hibernate.dialect.PostgreSQL10Dialect</property>
          
    <!-- Echo the SQL to stdout -->
    <property name="show_sql">true</property>
          
    <!-- Set the current session context -->
    <property name="current_session_context_class">thread</property>
    <property name="hibernate.show_sql">false</property>
          
    <!-- format the sql nice -->
    <property name="hibernate.format_sql">false</property>
          
    <!-- show the hql as comment -->
    <property name="use_sql_comments">false</property>
  </session-factory>
</hibernate-configuration>'`

echo "$CONTENT" > "${PERSISTENCE_DIR}/${CFG_FILE}"
