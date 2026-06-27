import { defaultConfig; type Config } "mo:openai-client/Config";
import ChatApi "mo:openai-client/Apis/ChatApi";
import CreateChatCompletionRequest "mo:openai-client/Models/CreateChatCompletionRequest";
import ChatCompletionRequestUserMessage "mo:openai-client/Models/ChatCompletionRequestUserMessage";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import TypesConfig "../types/config";

module {

  public func configForProvider(config : TypesConfig.AIConfig) : Config {
    let base = {
      defaultConfig with
      auth = ?#bearer(config.apiKey);
      is_replicated = ?false;
    };
    if (config.apiEndpoint != "") {
      { base with baseUrl = config.apiEndpoint };
    } else {
      base;
    };
  };

  public func runChatCompletion(config : TypesConfig.AIConfig, prompt : Text, transform : shared query OutCall.TransformationInput -> async OutCall.TransformationOutput) : async* Text {
    switch (config.provider) {
      case (#openai or #custom(_)) {
        await* runOpenAIChat(config, prompt);
      };
      case (#gemini or #anthropic) {
        await* runGenericHttpChat(config, prompt, transform);
      };
    };
  };

  func runOpenAIChat(config : TypesConfig.AIConfig, prompt : Text) : async* Text {
    let userMessage = ChatCompletionRequestUserMessage.JSON.init({
      content = #string(prompt);
      role = #user;
    });

    let req = CreateChatCompletionRequest.JSON.init({
      messages = [#user(userMessage)];
      model = config.modelId;
    });

    let openaiConfig = configForProvider(config);
    let resp = await* ChatApi.createChatCompletion(openaiConfig, req);

    if (resp.choices.size() == 0) {
      Runtime.trap("OpenAI returned no choices");
    };
    switch (resp.choices[0].message.content) {
      case (?text) text;
      case null Runtime.trap("OpenAI returned no text content");
    };
  };

  func runGenericHttpChat(config : TypesConfig.AIConfig, prompt : Text, transform : shared query OutCall.TransformationInput -> async OutCall.TransformationOutput) : async* Text {
    // For Gemini/Anthropic, make a simple HTTP POST and return raw response
    // Since Motoko JSON parsing is limited, we return the raw body
    let body = "{\"model\":\"" # config.modelId # "\",\"messages\":[{\"role\":\"user\",\"content\":\"" # prompt # "\"}]}";
    let headers = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer " # config.apiKey },
    ];

    let result = await OutCall.httpPostRequest(
      config.apiEndpoint # "/chat/completions",
      headers,
      body,
      transform,
    );
    result;
  };

};
