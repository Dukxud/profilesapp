const outputs = (() => {
  const modules = import.meta.glob('./amplify_outputs.json', {
    eager: true,
    import: 'default',
  });

  const config = modules['./amplify_outputs.json'];

  if (!config) {
    console.warn(
      '[amplifyOutputs] amplify_outputs.json is missing. Run `npx ampx generate outputs` to generate it for your environment.'
    );
    return {};
  }

  return config;
})();

export default outputs;
