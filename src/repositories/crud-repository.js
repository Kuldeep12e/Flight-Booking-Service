const {Logger} = require('../config')
const {StatusCodes} = require('http-status-codes');
const  AppError = require('../utils/errors/app-error');

class crudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
        const response = await this.model.create(data);
        return response;
  }
   async destroy (data){
  
        const response = await this.model.destroy({ 
            where:{
                id : data
            } 
            });

        if(!response){
            throw new AppError('The required resource is not available', StatusCodes.NOT_FOUND);
        }   
        return response;
   }


   async get(data){
  
        const response = await this.model.findByPk(data);
        if(!response){
            throw new AppError('The required resource is not available', StatusCodes.NOT_FOUND);
        }
        return response;            
    }

    async getAll() {
       
            const response = await this.model.findAll();
            return response;
        }

    async update(data, id) {
       
            const response = await this.model.update(data, { where: { id } });
            return response;
      
    }

 

}

module.exports = crudRepository;

