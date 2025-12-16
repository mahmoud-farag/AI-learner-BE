const pagination = (req, res, next) => {

    const paginationParams = {
        limit: req.query?.limit ? +req.query.limit : 20,
        offset: req.query?.offset ? +req.query.offset : 0,
    };

    req.paginationParams = paginationParams;

    next();
};

export default pagination;
