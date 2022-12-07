import {
  Engine,
  EngineOptions,
  RuleProperties,
  Fact,
  EngineResult,
} from 'json-rules-engine';

interface RuleEngineOptions {
  rules?: Array<RuleProperties>;
  options?: EngineOptions;
}

export class RuleEngine {
  private engine: Engine;

  constructor(params?: RuleEngineOptions) {
    this.engine = new Engine(params?.rules, params?.options);
  }

  addFact<T>(fact: Fact<T>): Engine {
    return this.engine.addFact<T>(fact);
  }

  removeFact(factOrId: string | Fact): boolean {
    return this.engine.removeFact(factOrId);
  }

  getFact<T>(factId: string): Fact<T> {
    return this.engine.getFact(factId);
  }

  run(facts?: Record<string, any>): Promise<EngineResult> {
    return this.engine.run(facts);
  }

  stop(): Engine {
    return this.engine.stop();
  }

  async addRule(rule: RuleProperties): Promise<Engine | undefined> {
    try {
      if (rule.name) {
        this.removeRule(rule.name);
      }

      const engine = await this.addRulePromise(rule);
      this.onAddRuleSuccess(rule);
      return engine;
    } catch (error) {
      this.onAddRuleFail(rule);
      console.error(`addRule FAILED --> ${JSON.stringify(error)}`);
      return undefined;
    }
  }

  async addRulePromise(rule: RuleProperties): Promise<Engine> {
    return new Promise((resolve, reject) => {
      try {
        const engine = this.engine.addRule(rule);
        resolve(engine);
      } catch (error) {
        console.error(`addRulePromise FAILED --> ${JSON.stringify(error)}`);
        reject(error);
      }
    });
  }

  async onAddRuleSuccess(rule: RuleProperties) {
    console.log(`onAddRuleSuccess: ${JSON.stringify(rule)}`);

    // TODO: 1/ Get rules from Cache. 2/ Append rule name to rules. 3/ Clean cache by cache key. 4/ Add rules to cache
  }

  async onAddRuleFail(rule: RuleProperties) {
    console.log(`onAddRuleFail: ${JSON.stringify(rule)}`);

    // TODO: 1/ Get rules from Cache. 2/ Remove cache by rule name. 3/ Clean cache by cache key. 4/ Add rules to cache
  }

  removeRule(name: string): boolean {
    if (name) {
      return false;
    }

    const isSuccess = this.engine.removeRule(name);
    if (isSuccess) {
      this.onRemoveRule(name);
    }

    return isSuccess;
  }

  async onRemoveRule(name: string) {
    console.log(`onRemoveRule: ${name}`);

    // TODO: 1/ Get rules from Cache. 2/ Remove cache by rule name. 3/ Clean cache by cache key. 4/ Add rules to cache
  }
}
