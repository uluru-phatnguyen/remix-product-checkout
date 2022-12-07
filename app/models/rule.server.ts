import { RuleEngine } from '~/utils/rule-engine';
import { RuleProperties, TopLevelCondition } from 'json-rules-engine';

export enum RuleOperator {
  EQUAL = 'equal',
  NOT_EQUAL = 'notEqual',
  IN = 'in',
  NOT_IN = 'notIn',
  CONTAINS = 'contains',
  DOES_NOT_CONTAIN = 'doesNotContain',
  LESS_THAN = 'lessThan',
  LESS_THAN_INCLUSIVE = 'lessThanInclusive',
  GREATER_THAN = 'greaterThan',
  GREATER_THAN_INCLUSIVE = 'greaterThanInclusive',
  INTERSECTION = 'intersection',
}

enum ConditionFact {
  COMPANY = 'company',
  SIZE = 'size',
}

enum EVENT_TYPE {
  DEAL = 'DEAL',
  DISCOUNT = 'DISCOUNT',
}

interface RuleOption {
  fact: ConditionFact;
  operator: RuleOperator;
  value: Record<string, any> | any;
  params?: Record<string, any>;
}

enum RuleType {
  all = 'all',
  any = 'any',
}

interface Conditions {
  [RuleType.all]?: RuleOption[];
  [RuleType.any]?: RuleOption[];
}

interface Event {
  type: EVENT_TYPE;
  params: Record<string, any> | any;
}

interface Rule {
  name: string;
  conditions: Conditions;
  event: Event;
}

interface RemoveRule {
  name: string;
}

interface RunRule {
  [ConditionFact.COMPANY]: string;
  [ConditionFact.SIZE]?: string;
}

const engine = new RuleEngine();

export async function addRule(params: Rule) {
  const rule: RuleProperties = {
    name: params.name,
    event: params.event,
    conditions: params.conditions as TopLevelCondition,
  };

  const result = await engine.addRule(rule);

  return {
    success: !!result
  };
}

export async function removeRule(params: RemoveRule) {
  const result = engine.removeRule(params.name);
  return {
    success: result,
  };
}

export async function runRule(params: RunRule) {
  const result = await engine.run(params);

  const data = result?.results?.map((item) => ({
    ...item.event,
    params: item?.event?.params,
  }));

  return {
    data: JSON.stringify(data),
  };
}
