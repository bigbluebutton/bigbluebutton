package org.bigbluebutton.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Order(1)
    @Configuration
    public static class V2Configuration extends WebSecurityConfigurerAdapter {

        @Value("${bbb.security.api_key}")
        private String principalRequestValue;

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            ApiKeyAuthenticationFilter filter = new ApiKeyAuthenticationFilter("Api-Key");
            filter.setAuthenticationManager(authentication -> {
                String principal = (String) authentication.getPrincipal();
                if (!principalRequestValue.equals(principal))
                    throw new BadCredentialsException("");
                authentication.setAuthenticated(true);
                return authentication;
            });

            http.antMatcher("/v2/**").csrf().disable().sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS).and().addFilter(filter).authorizeRequests()
                    .anyRequest().authenticated().and().exceptionHandling()
                    .authenticationEntryPoint(new V2AuthenticationEntryPoint());
        }
    }

    @Order(2)
    @Configuration
    public static class V1Configuration extends WebSecurityConfigurerAdapter {

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.antMatcher("/v1/**").csrf().disable().authorizeRequests().anyRequest().permitAll();
        }
    }

    @Order(3)
    @Configuration
    public static class DefaultConfiguration extends WebSecurityConfigurerAdapter {

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.antMatcher("/**").csrf().disable().authorizeRequests().anyRequest().denyAll();
        }
    }

}
