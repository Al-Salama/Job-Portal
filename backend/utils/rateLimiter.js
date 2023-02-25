const {RateLimiterMemory} = require("rate-limiter-flexible");

const opts = {
    points: 6, // 6 points
    duration: 1, // Per second
};
const requestRateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 5
});

const submitRateLimiter = new RateLimiterMemory({
    points: 2,
    duration: 15
});


async function requestLimiter(req, res, next) {
    let rateLimiterRes;
    let reachedLimit = false;
    try {rateLimiterRes = await requestRateLimiter.consume(req.ip, 1)} catch (error) {
        reachedLimit = true;
        rateLimiterRes = error;
    } finally {
        console.log("requestLimiter", `${reachedLimit && ", ERROR"}\n`, rateLimiterRes)
        if (reachedLimit) {
            res.status(429)
            .json({
                success: false,
                error: 429,
                message: "Too many requests"
            })
            return;
        }
    }

    next();
}

async function submitLimiter(req, res) {
    let rateLimiterRes;
    let reachedLimit = false;
    try {rateLimiterRes = await submitRateLimiter.consume(req.ip, 1)} catch (error) {
        reachedLimit = true;
        rateLimiterRes = error;
    } finally {
        console.log("submitLimiter", `${reachedLimit && ", ERROR"}\n`, rateLimiterRes)
        if (reachedLimit) {
            res.status(429)
            .json({
                success: false,
                error: 429,
                message: "Too many requests"
            })
            return false;
        }
    }

    return true;
}

module.exports = {
    requestLimiter,
    submitLimiter
}