export const softDeletePlugin = (schema) => {
    // Add isDeleted field to every schema that uses this plugin
    schema.add({
        isDeleted: {
            type: Boolean,
            default: false,
            select: false // Exclude from results by default unless explicitly requested
        },
        deletedAt: {
            type: Date,
            default: null,
            select: false
        }
    });

    // Middlewares to filter out deleted records
    schema.pre(/^find/, function () {
        // If 'includeDeleted' is set, we don't apply the filter
        if (!this.getOptions().includeDeleted) {
            this.where({ isDeleted: false });
        }
    });

    schema.pre('aggregate', function () {
        // Exclude deleted records from aggregation pipelines
        this.pipeline().unshift({ $match: { isDeleted: false } });
    });

    // Add a soft delete method to the schema
    schema.methods.softDelete = function () {
        this.isDeleted = true;
        this.deletedAt = new Date();
        return this.save();
    };
};
