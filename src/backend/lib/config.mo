import Config "../types/config";

module {

  public func defaultConfig() : Config.AIConfig {
    {
      provider = #openai;
      apiEndpoint = "https://api.openai.com/v1";
      apiKey = "";
      modelId = "gpt-4o-mini";
      maxTokens = 2048;
      temperature = 0.7;
      updatedAt = 0;
    };
  };

  public func validateConfig(config : Config.AIConfig) : Bool {
    if (config.apiEndpoint == "") return false;
    if (config.modelId == "") return false;
    if (config.maxTokens == 0) return false;
    if (config.temperature < 0.0 or config.temperature > 2.0) return false;
    true;
  };
};
