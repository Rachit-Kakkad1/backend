export default function normalizeAPI(apiLogic) {
  return {
    type: "api",
    metadata: {
      hasAuth: /auth|jwt|token/i.test(apiLogic),
      hasValidation: /validate|schema|joi/i.test(apiLogic),
    },
    entryPoint: "HTTP Request",
    logic: apiLogic,
  };
}
