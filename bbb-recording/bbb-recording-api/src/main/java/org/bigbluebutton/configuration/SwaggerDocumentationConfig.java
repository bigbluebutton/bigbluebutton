package org.bigbluebutton.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.service.ApiInfo;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerDocumentationConfig {

    @Bean
    public Docket customImplementation() {
        return new Docket(DocumentationType.OAS_30).select().apis(RequestHandlerSelectors.basePackage("io.swagger.api"))
                .build().directModelSubstitute(org.threeten.bp.LocalDate.class, java.sql.Date.class)
                .directModelSubstitute(org.threeten.bp.OffsetDateTime.class, java.util.Date.class).apiInfo(apiInfo());
    }

    ApiInfo apiInfo() {
        return new ApiInfoBuilder().title("Big Blue Button").description("API specification for Big Blue Button")
                .license("Apache 2.0").licenseUrl("http://www.apache.org/licenses/LICENSE-2.0.html")
                .termsOfServiceUrl("").version("2.0.0").contact(new Contact("", "", "ralam@blindsidenetworks.com"))
                .build();
    }

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI().info(new Info().title("Big Blue Button")
                .description("API specification for Big Blue Button").termsOfService("").version("2.0.0")
                .license(new License().name("Apache 2.0").url("http://www.apache.org/licenses/LICENSE-2.0.html"))
                .contact(new io.swagger.v3.oas.models.info.Contact().email("ralam@blindsidenetworks.com")));
    }

}
