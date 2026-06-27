module {
  public type AIProvider = {
    #openai;
    #gemini;
    #anthropic;
    #custom : Text;
  };

  public type AIConfig = {
    provider : AIProvider;
    apiEndpoint : Text;
    apiKey : Text;
    modelId : Text;
    maxTokens : Nat;
    temperature : Float;
    updatedAt : Nat;
  };

  public type AIConfigPublic = {
    provider : AIProvider;
    apiEndpoint : Text;
    modelId : Text;
    maxTokens : Nat;
    temperature : Float;
    updatedAt : Nat;
  };

  public func toPublic(config : AIConfig) : AIConfigPublic {
    {
      provider = config.provider;
      apiEndpoint = config.apiEndpoint;
      modelId = config.modelId;
      maxTokens = config.maxTokens;
      temperature = config.temperature;
      updatedAt = config.updatedAt;
    };
  };
};
