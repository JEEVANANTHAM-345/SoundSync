package com.soundsync.soundsyncbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * Allow both local development and
         * the deployed AWS Amplify frontend.
         */
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5500",
                        "http://127.0.0.1:5500",
                        "https://main.d2mcowfium27zq.amplifyapp.com"
                )
        );

        /*
         * Allow the methods used by SoundSync.
         */
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS",
                        "HEAD"
                )
        );

        /*
         * Allow all request headers.
         */
        configuration.setAllowedHeaders(
                List.of("*")
        );

        /*
         * SoundSync is not using cookies/authentication yet.
         */
        configuration.setAllowCredentials(false);

        /*
         * Expose headers useful for media requests.
         */
        configuration.setExposedHeaders(
                List.of(
                        "Content-Type",
                        "Content-Length",
                        "Content-Range",
                        "Accept-Ranges",
                        "Content-Disposition"
                )
        );

        /*
         * Apply this CORS configuration
         * to every backend endpoint.
         */
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}