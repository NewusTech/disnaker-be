module.exports = {

    response: (status, message, data, pagination) => {
        if (data || pagination) {
            return {
                status: status,
                message: message,
                data: data,
                pagination: pagination
            };
        }
        else {
            return {
                status: status,
                message: message
            };
        }

    },

}