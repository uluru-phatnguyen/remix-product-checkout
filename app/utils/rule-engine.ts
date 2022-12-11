import {
  Engine,
  EngineOptions,
  RuleProperties,
  Fact,
  EngineResult,
} from 'json-rules-engine';

export enum BOOLEAN_EXPRESSION {
  ALL = 'all',
  ANY = 'any',
}

export enum EVENT_TYPE {
  DISCOUNT = 'DISCOUNT',
  DEAL = 'DEAL',
}

// https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators
export enum RULE_OPERATOR {
  /** String & Numberic */
  EQUAL = 'equal',
  NOT_EQUAL = 'notEqual',

  /** Numberic */
  LESS_THAN = 'lessThan',
  LESS_THAN_INCLUSIVE = 'lessThanInclusive',
  GREATER_THAN = 'greaterThan',
  GREATER_THAN_INCLUSIVE = 'greaterThanInclusive',

  /** Array */
  IN = 'in',
  NOT_IN = 'notIn',
  CONTAINS = 'contains',
  DOES_NOT_CONTAIN = 'doesNotContain',
}

interface RuleEngineOptions {
  rules?: Array<RuleProperties>;
  options?: EngineOptions;
}

interface BasicCondition {
  fact: string;
  operator: string;
  value: number | string | Array<string>;
  param?: Record<string, any>;
  path?: string;
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
    // console.log(`onAddRuleSuccess: ${JSON.stringify(rule)}`);

    // TODO: 1/ Get rules from Cache. 2/ Append rule name to rules. 3/ Clean cache by cache key. 4/ Add rules to cache
  }

  async onAddRuleFail(rule: RuleProperties) {
    // console.log(`onAddRuleFail: ${JSON.stringify(rule)}`);

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
    // console.log(`onRemoveRule: ${name}`);

    // TODO: 1/ Get rules from Cache. 2/ Remove cache by rule name. 3/ Clean cache by cache key. 4/ Add rules to cache
  }
}
