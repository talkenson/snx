module.exports = {
  rules: {
    'poke-return-on-resolve-reject': {
      defaultOptions: [],
      meta: {
        type: 'suggestion',
        fixable: 'code',
        docs: {
          description: 'Wants return statement before resolve/reject',
          recommended: 'warn',
        },
        fixTypes: 'suggestion',
        schema: [], // no options
        messages: {
          noReturnBeforeResolve:
            'Missing `return` statement before resolve handler.',
          noReturnBeforeReject:
            'Missing `return` statement before reject handler.',
        },
      },
      create(context) {
        return {
          'Property[key.name="register"] CallExpression ArrowFunctionExpression ArrowFunctionExpression BlockStatement :not(ReturnStatement) > CallExpression[callee.name="reject"]'(
            node,
          ) {
            context.report({
              node: node,
              messageId: 'noReturnBeforeReject',
              fix: fixer => fixer.insertTextBefore(node, 'return '),
            })
          },
          'Property[key.name="register"] CallExpression ArrowFunctionExpression ArrowFunctionExpression BlockStatement :not(ReturnStatement) > CallExpression[callee.name="resolve"]'(
            node,
          ) {
            context.report({
              node: node,
              messageId: 'noReturnBeforeResolve',
              fix: fixer => fixer.insertTextBefore(node, 'return '),
            })
          },
        }
      },
    },
  },
}
