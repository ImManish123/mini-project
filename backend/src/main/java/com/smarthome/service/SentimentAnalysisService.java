package com.smarthome.service;

import com.smarthome.dto.SentimentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.*;

@Service
@Slf4j
public class SentimentAnalysisService {

    private static final Map<String, List<String>> CATEGORY_QUESTION_BANK = Map.of(
        "plumbing", List.of(
            "Was the leak, blockage, or plumbing issue fully fixed?",
            "Did water pressure and flow improve after the service?",
            "Were pipes, taps, and joints checked for hidden leaks?",
            "Did the professional keep the bathroom/kitchen area clean after work?",
            "Did the plumber explain what caused the issue and how to prevent it?"),
        "electrical", List.of(
            "Were all switches, sockets, and fixtures tested after repair?",
            "Was the electrical issue resolved without repeated tripping or sparks?",
            "Did the electrician follow safe practices while working?",
            "Was the fault diagnosis explained clearly before fixing?",
            "Are you satisfied with the quality and safety of the final work?"),
        "cleaning", List.of(
            "Were the requested areas cleaned thoroughly?",
            "Was dust, stains, or buildup removed effectively?",
            "Was the service completed within the promised time?",
            "Did the cleaner use proper materials without damaging surfaces?",
            "Are you satisfied with the hygiene level after completion?"),
        "painting", List.of(
            "Was the paint finish smooth and consistent across walls/surfaces?",
            "Were edges, corners, and trims painted neatly?",
            "Was proper surface preparation done before painting?",
            "Were spills, stains, or paint marks cleaned after completion?",
            "Did the final color and quality match your expectation?"),
        "carpentry", List.of(
            "Was the furniture or woodwork repaired/installed correctly?",
            "Are alignment, fitting, and stability satisfactory?",
            "Was the work finished with clean edges and neat detailing?",
            "Did the carpenter use durable materials and proper hardware?",
            "Was the area cleaned and debris removed after work?"),
        "ac", List.of(
            "Is the cooling performance better after the AC service?",
            "Were filters, vents, and coils cleaned properly?",
            "Is the AC running quietly without unusual noise or smell?",
            "Did the technician check gas level and overall unit health?",
            "Was the service explained with maintenance tips for better performance?")
    );

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> generateAtsQuestions(String category) {
        String normalizedCategory = normalizeCategory(category);
        List<String> categoryFallback = getCategorySpecificFallbackQuestions(normalizedCategory);

        if (apiKey == null || apiKey.isEmpty()) {
            return categoryFallback;
        }
        try {
            String prompt = "You are generating an ATS (Automated Tracking Score) survey for a completed '"
                    + normalizedCategory
                    + "' service. Generate exactly 5 short questions that are specific to this service type. "
                    + "Avoid generic questions. Focus on technical quality, completion, cleanliness/safety, and customer satisfaction for this service. "
                    + "Return one question per line.";
            
            // Build Gemini request
            Map<String, Object> textPart = new HashMap<>(); textPart.put("text", prompt);
            Map<String, Object> contentParts = new HashMap<>(); contentParts.put("parts", List.of(textPart));
            Map<String, Object> requestBody = new HashMap<>(); requestBody.put("contents", List.of(contentParts));
            
            Map<String, Object> genConfig = new HashMap<>(); genConfig.put("temperature", 0.7);
            requestBody.put("generationConfig", genConfig);
            
            HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl + "?key=" + apiKey, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                String text = (String) parts.get(0).get("text");
                
                List<String> aiQuestions = parseQuestionsFromText(text);
                if (!aiQuestions.isEmpty()) {
                    LinkedHashSet<String> merged = new LinkedHashSet<>(aiQuestions);
                    merged.addAll(categoryFallback);
                    List<String> finalQuestions = new ArrayList<>(merged);
                    if (finalQuestions.size() >= 5) {
                        return finalQuestions.subList(0, 5);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error generating ATS questions: {}", e.getMessage());
        }
        return categoryFallback;
    }

    public com.smarthome.dto.AtsScoreResponse calculateAtsScore(Map<String, String> answers) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("YOUR_")) {
            return basicAtsScoreCalculation(answers);
        }
        try {
            StringBuilder promptBuilder = new StringBuilder("Calculate an ATS (Automated Tracking Score) out of 100 based on the following customer QA survey for a home service. \n\n");
            for (Map.Entry<String, String> entry : answers.entrySet()) {
                promptBuilder.append("Q: ").append(entry.getKey()).append("\n");
                promptBuilder.append("A: ").append(entry.getValue()).append("\n\n");
            }
            promptBuilder.append("Respond EXACTLY in this format:\nSCORE: <number 0-100>\nEXPLANATION: <short 1-sentence reason>\n");

            Map<String, Object> textPart = new HashMap<>(); textPart.put("text", promptBuilder.toString());
            Map<String, Object> contentParts = new HashMap<>(); contentParts.put("parts", List.of(textPart));
            Map<String, Object> requestBody = new HashMap<>(); requestBody.put("contents", List.of(contentParts));

            HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl + "?key=" + apiKey, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                String text = (String) parts.get(0).get("text");

                int score = extractInt(text, "SCORE:\\s*(\\d+)");
                if (score <= 0) score = 80;
                if (score > 100) score = 100;
                String explanation = extractString(text, "EXPLANATION:\\s*(.+)");
                if (explanation == null) explanation = "AI evaluation complete.";

                return com.smarthome.dto.AtsScoreResponse.builder().atsScore(score).explanation(explanation).build();
            }
        } catch (Exception e) {
            log.warn("Error calculating ATS score with API (fallback used): {}", e.getMessage());
        }
        return basicAtsScoreCalculation(answers);
    }

    private com.smarthome.dto.AtsScoreResponse basicAtsScoreCalculation(Map<String, String> answers) {
        int atsScore = 85;
        int negativeCount = 0;
        int positiveCount = 0;
        String text = answers.values().toString().toLowerCase();
        
        String[] negativeWords = { "bad", "terrible", "worst", "horrible", "poor", "awful", "rude", "unprofessional", "dirty", "slow", "late", "expensive", "waste", "disappointed", "never", "hate", "angry", "complaint", "damage", "broken", "useless", "pathetic", "no", "not" };
        String[] positiveWords = { "excellent", "amazing", "great", "good", "fantastic", "wonderful", "professional", "perfect", "best", "awesome", "happy", "satisfied", "thank", "recommend", "love", "clean", "fast", "quick", "helpful", "friendly", "nice", "yes", "did" };
        
        for (String word : negativeWords) {
            if (text.contains(word)) negativeCount++;
        }
        for (String word : positiveWords) {
            if (text.contains(word)) positiveCount++;
        }
        
        if (negativeCount > 0) {
            atsScore = Math.max(10, 85 - (negativeCount * 25));
        } else if (positiveCount > 0) {
            atsScore = Math.min(100, 85 + (positiveCount * 5));
        }
        
        String explanation = "ATS calculated based on keyword analysis.";
        if (negativeCount > positiveCount) explanation = "Score reduced due to negative keywords in answers.";
        else if (positiveCount > negativeCount) explanation = "Strong score based on positive affirmative answers.";

        return com.smarthome.dto.AtsScoreResponse.builder().atsScore(atsScore).explanation(explanation).build();
    }
    public SentimentResponse analyzeSentiment(String comment) {
        if (comment == null || comment.trim().isEmpty()) {
            return getDefaultResponse();
        }

        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Gemini API key not configured. Using basic sentiment analysis.");
            return basicSentimentAnalysis(comment);
        }

        try {
            String prompt = buildPrompt(comment);
            String url = apiUrl + "?key=" + apiKey;

            // Build Gemini API request body
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> contentParts = new HashMap<>();
            contentParts.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentParts));

            // Generation config for structured output
            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("temperature", 0.1);
            genConfig.put("maxOutputTokens", 256);
            requestBody.put("generationConfig", genConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseGeminiResponse(response.getBody());
            }

            log.warn("Gemini API returned non-OK status: {}", response.getStatusCode());
            return basicSentimentAnalysis(comment);

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return basicSentimentAnalysis(comment);
        }
    }

    private String buildPrompt(String comment) {
        return "Analyze the sentiment of the following customer review for a home service (like plumbing, cleaning, electrician, etc.).\n\n"
                +
                "Review: \"" + comment + "\"\n\n" +
                "Respond in EXACTLY this format (nothing else):\n" +
                "RATING: <number 1 to 5>\n" +
                "SENTIMENT: <POSITIVE or NEUTRAL or NEGATIVE>\n" +
                "SCORE: <decimal 0.0 to 1.0 representing confidence>\n" +
                "EXPLANATION: <one short sentence explaining why>\n\n" +
                "Rules:\n" +
                "- RATING 5 = Excellent/Amazing service\n" +
                "- RATING 4 = Good service, minor issues\n" +
                "- RATING 3 = Average/OK service\n" +
                "- RATING 2 = Below average, some problems\n" +
                "- RATING 1 = Terrible/Very bad service\n" +
                "- POSITIVE = rating 4-5\n" +
                "- NEUTRAL = rating 3\n" +
                "- NEGATIVE = rating 1-2\n" +
                "- SCORE should reflect how confident you are (0.5 = unsure, 1.0 = very confident)";
    }

    @SuppressWarnings("unchecked")
    private SentimentResponse parseGeminiResponse(Map<String, Object> responseBody) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return getDefaultResponse();
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String text = (String) parts.get(0).get("text");

            log.info("Gemini raw response: {}", text);

            // Parse structured response
            int rating = extractInt(text, "RATING:\\s*(\\d)");
            String sentiment = extractString(text, "SENTIMENT:\\s*(POSITIVE|NEUTRAL|NEGATIVE)");
            double score = extractDouble(text, "SCORE:\\s*([0-9.]+)");
            String explanation = extractString(text, "EXPLANATION:\\s*(.+)");

            // Validate
            if (rating < 1 || rating > 5)
                rating = 3;
            if (sentiment == null)
                sentiment = "NEUTRAL";
            if (score < 0 || score > 1)
                score = 0.5;
            if (explanation == null)
                explanation = "AI analysis completed.";

            return SentimentResponse.builder()
                    .suggestedRating(rating)
                    .sentimentLabel(sentiment)
                    .sentimentScore(score)
                    .explanation(explanation.trim())
                    .build();

        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            return getDefaultResponse();
        }
    }

    /**
     * Basic keyword-based sentiment analysis as fallback when API is unavailable
     */
    private SentimentResponse basicSentimentAnalysis(String comment) {
        String lower = comment.toLowerCase();

        // Positive keywords
        String[] positiveWords = { "excellent", "amazing", "great", "good", "fantastic", "wonderful",
                "professional", "perfect", "best", "awesome", "happy", "satisfied", "thank",
                "recommend", "love", "clean", "fast", "quick", "helpful", "friendly", "nice",
                "superb", "brilliant", "outstanding", "impressed" };

        // Negative keywords
        String[] negativeWords = { "bad", "terrible", "worst", "horrible", "poor", "awful",
                "rude", "unprofessional", "dirty", "slow", "late", "expensive", "waste",
                "disappointed", "never", "hate", "angry", "complaint", "damage", "broken",
                "useless", "pathetic", "fraud", "cheat", "scam" };

        int positiveCount = 0;
        int negativeCount = 0;

        for (String word : positiveWords) {
            if (lower.contains(word))
                positiveCount++;
        }
        for (String word : negativeWords) {
            if (lower.contains(word))
                negativeCount++;
        }

        int rating;
        String sentiment;
        double score;
        String explanation;

        if (positiveCount > negativeCount) {
            rating = positiveCount >= 3 ? 5 : 4;
            sentiment = "POSITIVE";
            score = Math.min(0.6 + (positiveCount * 0.1), 0.95);
            explanation = "The review contains positive language about the service.";
        } else if (negativeCount > positiveCount) {
            rating = negativeCount >= 3 ? 1 : 2;
            sentiment = "NEGATIVE";
            score = Math.min(0.6 + (negativeCount * 0.1), 0.95);
            explanation = "The review contains negative feedback about the service.";
        } else {
            rating = 3;
            sentiment = "NEUTRAL";
            score = 0.5;
            explanation = "The review has mixed or neutral sentiment.";
        }

        return SentimentResponse.builder()
                .suggestedRating(rating)
                .sentimentLabel(sentiment)
                .sentimentScore(score)
                .explanation(explanation + " (Basic analysis - configure Gemini API key for AI-powered analysis)")
                .build();
    }

    private SentimentResponse getDefaultResponse() {
        return SentimentResponse.builder()
                .suggestedRating(3)
                .sentimentLabel("NEUTRAL")
                .sentimentScore(0.5)
                .explanation("Unable to analyze sentiment. Default neutral rating applied.")
                .build();
    }

    // Helper methods for regex extraction
    private int extractInt(String text, String pattern) {
        Matcher m = Pattern.compile(pattern).matcher(text);
        return m.find() ? Integer.parseInt(m.group(1)) : 3;
    }

    private double extractDouble(String text, String pattern) {
        Matcher m = Pattern.compile(pattern).matcher(text);
        return m.find() ? Double.parseDouble(m.group(1)) : 0.5;
    }

    private String extractString(String text, String pattern) {
        Matcher m = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(text);
        return m.find() ? m.group(1) : null;
    }

    private String normalizeCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return "general service";
        }
        return category.trim().toLowerCase(Locale.ROOT);
    }

    private List<String> getCategorySpecificFallbackQuestions(String normalizedCategory) {
        for (Map.Entry<String, List<String>> entry : CATEGORY_QUESTION_BANK.entrySet()) {
            if (normalizedCategory.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return Arrays.asList(
                "Did the " + normalizedCategory + " professional arrive on time?",
                "Was the " + normalizedCategory + " issue fully resolved?",
                "Was the quality of the " + normalizedCategory + " work satisfactory?",
                "Was pricing and scope of the " + normalizedCategory + " service clear and fair?",
                "Would you recommend this " + normalizedCategory + " service to others?");
    }

    private List<String> parseQuestionsFromText(String text) {
        List<String> questions = new ArrayList<>();
        for (String line : text.split("\\r?\\n")) {
            String q = line.trim();
            if (q.isEmpty()) {
                continue;
            }

            q = q.replaceFirst("^[-*]\\s*", "");
            q = q.replaceFirst("^\\d+[).]\\s*", "");
            q = q.trim();
            if (!q.isEmpty()) {
                questions.add(q);
            }
        }
        return questions;
    }
}

