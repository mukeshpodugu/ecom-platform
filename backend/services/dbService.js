const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Cache JSON data in memory to speed up mock operations
const mockCache = {};

const getFilePath = (collection) => {
  return path.join(__dirname, '..', 'data', `${collection}.json`);
};

const readCollection = (collection) => {
  const filePath = getFilePath(collection);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading mock collection ${collection}:`, error);
    return [];
  }
};

const writeCollection = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing mock collection ${collection}:`, error);
  }
};

// Helper to evaluate a MongoDB-like query on an object
const matchQuery = (item, query) => {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key in query) {
    const val = query[key];
    const itemVal = item[key];

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Handle operators: $regex, $gt, $lt, $gte, $lte, $in, $ne
      for (const op in val) {
        const opVal = val[op];
        if (op === '$regex') {
          const options = val.$options || '';
          const regex = new RegExp(opVal, options);
          if (!regex.test(itemVal || '')) return false;
        } else if (op === '$gt') {
          if (!(itemVal > opVal)) return false;
        } else if (op === '$lt') {
          if (!(itemVal < opVal)) return false;
        } else if (op === '$gte') {
          if (!(itemVal >= opVal)) return false;
        } else if (op === '$lte') {
          if (!(itemVal <= opVal)) return false;
        } else if (op === '$ne') {
          if (itemVal === opVal) return false;
        } else if (op === '$in') {
          if (!Array.isArray(opVal) || !opVal.includes(itemVal)) return false;
        }
      }
    } else {
      // Direct equality
      if (itemVal !== val) {
        // String representation check for matching ObjectIds vs strings
        if (String(itemVal) !== String(val)) {
          return false;
        }
      }
    }
  }
  return true;
};

const dbService = {
  // Collection name mapping to Mongoose models
  models: {},

  registerModel(name, mongooseModel) {
    this.models[name] = mongooseModel;
  },

  async find(collection, query = {}, options = {}) {
    if (global.dbMode === 'mongodb') {
      let q = this.models[collection].find(query);
      if (options.sort) q = q.sort(options.sort);
      if (options.skip) q = q.skip(options.skip);
      if (options.limit) q = q.limit(options.limit);
      if (options.populate) {
        const popFields = Array.isArray(options.populate) ? options.populate : [options.populate];
        popFields.forEach(f => { q = q.populate(f); });
      }
      return await q.exec();
    } else {
      let items = readCollection(collection);
      // Filter
      items = items.filter(item => matchQuery(item, query));
      
      // Sort
      if (options.sort) {
        const sortKeys = Object.keys(options.sort);
        if (sortKeys.length > 0) {
          const key = sortKeys[0];
          const order = options.sort[key] === -1 ? -1 : 1;
          items.sort((a, b) => {
            if (a[key] < b[key]) return -1 * order;
            if (a[key] > b[key]) return 1 * order;
            return 0;
          });
        }
      }

      // Populate Mock Fallback (very simple populate)
      if (options.populate && items.length > 0) {
        const popFields = Array.isArray(options.populate) ? options.populate : [options.populate];
        popFields.forEach(fieldObj => {
          let field = typeof fieldObj === 'string' ? fieldObj : fieldObj.path;
          let refCol = null;
          if (field === 'user') refCol = 'users';
          if (field === 'product' || field === 'products') refCol = 'products';
          if (field === 'seller') refCol = 'sellers';
          if (field === 'category') refCol = 'categories';
          if (field === 'products.product') {
            // Nested array population
            const related = readCollection('products');
            items.forEach(item => {
              if (item.products && Array.isArray(item.products)) {
                item.products.forEach(pObj => {
                  pObj.product = related.find(r => String(r._id) === String(pObj.product || pObj.productId)) || pObj.product;
                });
              }
            });
            return;
          }

          if (refCol) {
            const related = readCollection(refCol);
            items.forEach(item => {
              if (item[field]) {
                if (Array.isArray(item[field])) {
                  item[field] = item[field].map(id => related.find(r => String(r._id) === String(id)) || id);
                } else {
                  item[field] = related.find(r => String(r._id) === String(item[field])) || item[field];
                }
              }
            });
          }
        });
      }

      // Skip and Limit
      const skip = options.skip || 0;
      const limit = options.limit || items.length;
      return items.slice(skip, skip + limit);
    }
  },

  async findOne(collection, query = {}, options = {}) {
    if (global.dbMode === 'mongodb') {
      let q = this.models[collection].findOne(query);
      if (options.populate) {
        const popFields = Array.isArray(options.populate) ? options.populate : [options.populate];
        popFields.forEach(f => { q = q.populate(f); });
      }
      return await q.exec();
    } else {
      const results = await this.find(collection, query, { ...options, limit: 1 });
      return results[0] || null;
    }
  },

  async findById(collection, id, options = {}) {
    if (global.dbMode === 'mongodb') {
      let q = this.models[collection].findById(id);
      if (options.populate) {
        const popFields = Array.isArray(options.populate) ? options.populate : [options.populate];
        popFields.forEach(f => { q = q.populate(f); });
      }
      return await q.exec();
    } else {
      return await this.findOne(collection, { _id: id }, options);
    }
  },

  async create(collection, data) {
    if (global.dbMode === 'mongodb') {
      const Model = this.models[collection];
      const doc = new Model(data);
      return await doc.save();
    } else {
      const items = readCollection(collection);
      const newDoc = {
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      };
      items.push(newDoc);
      writeCollection(collection, items);
      return newDoc;
    }
  },

  async findByIdAndUpdate(collection, id, updateData, options = { new: true }) {
    if (global.dbMode === 'mongodb') {
      return await this.models[collection].findByIdAndUpdate(id, updateData, options);
    } else {
      const items = readCollection(collection);
      const index = items.findIndex(item => String(item._id) === String(id));
      if (index === -1) return null;

      // Flatten updates (Mongoose-like $set support or direct properties)
      let updateFields = updateData;
      if (updateData.$set) {
        updateFields = { ...updateFields, ...updateData.$set };
        delete updateFields.$set;
      }
      if (updateData.$push) {
        // Mock $push
        for (const key in updateData.$push) {
          if (!items[index][key]) items[index][key] = [];
          items[index][key].push(updateData.$push[key]);
        }
        delete updateFields.$push;
      }
      if (updateData.$pull) {
        // Mock $pull
        for (const key in updateData.$pull) {
          if (items[index][key] && Array.isArray(items[index][key])) {
            const pullFilter = updateData.$pull[key];
            if (typeof pullFilter === 'object') {
              // Pull by object property
              const filterKey = Object.keys(pullFilter)[0];
              items[index][key] = items[index][key].filter(e => String(e[filterKey]) !== String(pullFilter[filterKey]));
            } else {
              items[index][key] = items[index][key].filter(e => String(e) !== String(pullFilter));
            }
          }
        }
        delete updateFields.$pull;
      }

      items[index] = {
        ...items[index],
        ...updateFields,
        updatedAt: new Date().toISOString()
      };
      
      writeCollection(collection, items);
      return items[index];
    }
  },

  async findOneAndUpdate(collection, query, updateData, options = { new: true }) {
    if (global.dbMode === 'mongodb') {
      return await this.models[collection].findOneAndUpdate(query, updateData, options);
    } else {
      const doc = await this.findOne(collection, query);
      if (!doc) return null;
      return await this.findByIdAndUpdate(collection, doc._id, updateData, options);
    }
  },

  async findByIdAndDelete(collection, id) {
    if (global.dbMode === 'mongodb') {
      return await this.models[collection].findByIdAndDelete(id);
    } else {
      const items = readCollection(collection);
      const index = items.findIndex(item => String(item._id) === String(id));
      if (index === -1) return null;
      const removed = items.splice(index, 1)[0];
      writeCollection(collection, items);
      return removed;
    }
  },

  async findOneAndDelete(collection, query) {
    if (global.dbMode === 'mongodb') {
      return await this.models[collection].findOneAndDelete(query);
    } else {
      const doc = await this.findOne(collection, query);
      if (!doc) return null;
      return await this.findByIdAndDelete(collection, doc._id);
    }
  },

  async countDocuments(collection, query = {}) {
    if (global.dbMode === 'mongodb') {
      return await this.models[collection].countDocuments(query);
    } else {
      const items = readCollection(collection);
      return items.filter(item => matchQuery(item, query)).length;
    }
  }
};

module.exports = dbService;
