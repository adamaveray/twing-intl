import type { TwingEnvironment, TwingNodeExecutor, TwingTemplate } from 'twing';
import { executeNode } from 'twing';

type NodeExecutorWrapper = (nodeExecutor: TwingNodeExecutor) => TwingNodeExecutor;

function hackilyWrapTemplateNodeExecutor(template: TwingTemplate, wrappingFn: NodeExecutorWrapper): void {
  const originalExecute = template.execute;
  template.execute = async function patchedExecute(environment, context, blocks, outputBuffer, options = {}) {
    options.nodeExecutor = wrappingFn(options.nodeExecutor ?? executeNode);
    return Reflect.apply(originalExecute, this, [environment, context, blocks, outputBuffer, options]);
  };
}

export function hackilyWrapEnvironmentNodeExecutor(
  environment: TwingEnvironment,
  wrappingFn: NodeExecutorWrapper,
): void {
  const originalLoadTemplate = environment.loadTemplate;
  environment.loadTemplate = async function patchedLoadTemplate(...args) {
    const template = await Reflect.apply(originalLoadTemplate, this, args);
    hackilyWrapTemplateNodeExecutor(template, wrappingFn);
    return template;
  };
}
