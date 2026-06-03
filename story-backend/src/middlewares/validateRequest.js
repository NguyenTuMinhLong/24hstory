// Middleware validate request body/params/query bằng Zod schema
export const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        const dataToValidate = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
        const result = schema.safeParse(dataToValidate);

        if (!result.success) {
            const errors = result.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }
        req[source] = result.data;
        next();
    };
};
