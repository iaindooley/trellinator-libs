/**
* @class IterableCollection
* @memberof module:TrellinatorCore
* @constructor
* @param obj {Object} an object or Array that you would
*                     like to iterate over
* @classdesc The IterableCollection is used as the primary
* collection class for returning groups of objects or
* entities. Whenever you load, for example, an array of
* Card objects, you will get an IterableCollection
* back as the return value.
* @example
* new Trellinator().board("My Board").list("My List")
* .cards().each(function(card)
* {
*     card.postComment("I am card "+card.id());
* });
*/
var IterableCollection = function(obj)
{
    this.obj = obj;

    /**
    * Return a new IterableCollection containing
    * all objects returned from a callback. The
    * callback can modify the object if required,
    * 
    * @memberof module:TrellinatorCore.IterableCollection
    * @param comparator {Function} a callback
    * function to use in order to identify what
    * objects you're looking for
    * @example
    * try
    * {
    *     //using find() instead of transform
    *     //means we will have cached the list of
    *     //cards and won't need to reload if we 
    *     //do another find function later
    *     notif.board().cards().find(function(elem)
    *     {
    *         if(new RegExp("Search.*").test(elem.description()))
    *             return elem;
    *         else
    *             return false;
    *     }).first().postComment("Twinsies!");
    * }
    * 
    * catch(e)
    * {
    *     Notification.expectException(InvalidDataException,e);
    *     Trellinator.log("Looks like: "+my_card.name()+" wasn't found");
    * }
    */
    this.find = function(callback)
    {
        var new_obj = {};

        for(var key in this.obj)
        {
            if((transformed = callback(this.obj[key],key)) !== false)
                new_obj[key] = transformed;
        }
        
        return new IterableCollection(new_obj);
    }

    /**
    * Return a concatenated string of the values
    * in this collection separated by a
    * common separator, optionally with each
    * value being augmented by a callback, similar to
    * Array.join()
    * @memberof module:TrellinatorCore.IterableCollection
    * @param separator {string} (optional) the string to
    *        separate each value in the return string, 
    *        defaults to &
    * @param callback {Function} (optional) a function
    *        to augment each value before concatenating
    * @example
    * //prints "one","two"
    * console.log('"'+new IterableCollection({one: "one",two: "two"})
    * .implodeValues(",",function(elem)
    * {
    *     return '"'+elem+'"';
    * })+'"');
    * @example
    * //prints a semi-colon separated list of card names
    * console.log(notif.board().cards().implode(";",function(card)
    * {
    *     return card.name();
    * }));
    */
    this.implodeValues = function(separator,callback)
    {
        if(!separator)
            separator = "&";

        if(!callback)
        {
            callback = function(elem,key)
            {
                return elem;
            };
        }

        var ret = "";

        for(var key in this.obj)
        {
            var called = callback(this.obj[key],key);
            
            if(!ret)
                ret = called;
            else
                ret += called ? separator+callback(this.obj[key],key):called;
        }
        
        return ret;
    }

    /**
    * Concatenate all the items in a collection in
    * key=value pairs separated by a separator,
    * optionally with each value being augmented
    * by a callback (basically for creating query strings)
    * @memberof module:TrellinatorCore.IterableCollection
    * @param separator {string} (optional) the separator
    *        to be included between each key=value pair
    *        defaults to &
    * @param callback {Function} (optional) a callback to 
    *        be used to augment the value in each key=value
    *        pair
    * @example
    * var params = {name: "Kieth",
    *               strengths: "Accounts",
    *               weaknesses: "Eczema"};
    * HttpApi.call("post",base_url+params.implode("&",function(elem)
    * {
    *     return encodeURIComponent(elem);
    * }));
    */
    this.implode = function(separator,callback)
    {
        if(!separator)
            separator = "&";

        if(!callback)
        {
            callback = function(elem,key)
            {
                return elem;
            };
        }

        var ret = "";

        for(var key in this.obj)
        {
            if(!ret)
                ret = key+"="+callback(this.obj[key],key);
            else
                ret += separator+key+"="+callback(this.obj[key],key);
        }
        
        return ret;
    }

    /**
    * Return the item in this collection that appears
    * before a given item, identified by an expression,
    * optionally passing in a callback function used
    * to compare the element with the expression.
    * 
    * By default the expression can be a string or a 
    * RegExp and the comparison will be done based
    * on calling the name() method of the element.
    * 
    * A common use case is to find the previous list
    * in a Trello board that appears after a list
    * with a given name.
    * 
    * @memberof module:TrellinatorCore.IterableCollection
    * @param expression {string|RegExp} a string or RegExp
    * indicating the element before which you'd like to find
    * the previous item.
    * @param inspector {Function} (optional) a callback 
    * used to compare the items to the expression. This
    * should accept 2 parameters:
    *  - test {string|RegExp} The expression that you passed in
    *    to the original function
    *  - elem {Object} the item from the collection to be
    *    compared to the test expression
    * the function should return true if the element matches
    * the expression.
    * @example
    * var prev_list = notif.board().lists().itemBefore(new RegExp("Inbox.*"));
    * @example
    * var prev_card = notif.board().list("Test")
    * .cards().itemBefore(my_card.id(),function(test,elem)
    * {
    *     return test == elem.id();
    * });
    * @throws InvalidDataException
    */
    this.itemBefore = function(expression,inspector)
    {
      var ret         = null;
      var prev = null;
      var next = null;
      var return_prev = false;
      
      if(!inspector)
      {
        inspector = function(test,elem)
        {
          return TrelloApi.nameTest(TrelloApi.nameTestData(test),elem.name());
        };
      }
      
      if(expression)
      {
        for(var key in this.obj)
        {
          if(return_prev)
          {
            ret = prev;
            prev = next;
            return_prev = false;
          }
          
          if(inspector(expression,this.obj[key]))
          {
            return_prev = true;
            next = this.obj[key];
          }
          
          else
          {
            prev = this.obj[key];
          }
        }
      }
      
      if(return_prev)
      {
        ret = prev;
        return_prev = false;
      }
      
      if(!ret)
        throw new InvalidDataException("There was no item before: "+expression);
      
      return ret;
    }
    
    /**
    * Return the item in this collection that appears
    * after a given item, identified by an expression,
    * optionally passing in a callback function used
    * to compare the element with the expression.
    * 
    * By default the expression can be a string or a 
    * RegExp and the comparison will be done based
    * on calling the name() method of the element.
    * 
    * A common use case is to find the next list
    * in a Trello board that appears after a list
    * with a given name.
    * 
    * @memberof module:TrellinatorCore.IterableCollection
    * @param expression {string|RegExp} a string or RegExp
    * indicating the element after which you'd like to find
    * the next item.
    * @param inspector {Function} (optional) a callback 
    * used to compare the items to the expression. This
    * should accept 2 parameters:
    *  - test {string} The expression that you passed in
    *    to the original function
    *  - elem {Object} the item from the collection to be
    *    compared to the test expression
    * the function should return true if the element matches
    * the expression.
    * @example
    * var next_list = notif.board().lists().itemAfter(new RegExp("Inbox.*"));
    * @example
    * var next_card = notif.board().list("Test")
    * .cards().itemAfter(my_card.id(),function(test,elem)
    * {
    *     return test == elem.id();
    * });
    * @throws InvalidDataException
    */
    this.itemAfter = function(expression,inspector)
    {
        var ret         = null;
        var return_next = false;
        
        if(!inspector)
        {
            inspector = function(test,elem)
            {
                return TrelloApi.nameTest(TrelloApi.nameTestData(test),elem.name());
            };
        }
      
        if(expression)
        {
            for(var key in this.obj)
            {
                if(return_next)
                {
                    return_next = false;
                    ret = this.obj[key];
                }

                else if(inspector(expression,this.obj[key]))
                    return_next = true;
            }
        }
        
        if(!ret)
            throw new InvalidDataException("There was no item after: "+expression);
            
        return ret;
    }

    /**
    * Return a random element from this collection
    * @memberof module:TrellinatorCore.IterableCollection
    * @throws InvalidDataException
    */
    this.random = function()
    {
        if(!this.length())
            throw new InvalidDataException("No items in IterableCollection when selecting a random element");

        var keys = Object.keys(this.obj)
        return this.obj[keys[ keys.length * Math.random() << 0]];
    }

    /**
    * Return the first element from this collection
    * @memberof module:TrellinatorCore.IterableCollection
    * @throws InvalidDataException
    */
    this.first = function()
    {
        var ret = null;

        for(var key in this.obj)
        {
            if(ret === null)
                ret = this.obj[key];
        }
        
        if(ret === null)
            throw new InvalidDataException("No data in IterableCollection: "+this.obj);
        
        return ret;
    }
    
    /**
    * Reverse the order of this collection
    * @memberof module:TrellinatorCore.IterableCollection
    * @throws InvalidDataException
    */
    this.reverse = function()
    {
        return new IterableCollection(this.asArray().reverse());
    }

    /**
    * Return the last element from this collection
    * @memberof module:TrellinatorCore.IterableCollection
    * @throws InvalidDataException
    */
    this.last = function()
    {
        return new IterableCollection(this.asArray().reverse()).first();
    }

    /**
    * Iterate over this collection, passing
    * each element into a callback function
    * @memberof module:TrellinatorCore.IterableCollection
    * @param callback {Function} the function
    * into which each element will be passed.
    * The first parameter passed in is the element
    * but you can optionally accept a second
    * parameter which is the key
    * @example
    * notif.board().list("List").cards().each(function(card)
    * {
    *     card.postComment("@board Hi! My name is: "+card.name());
    * });
    * @example
    * var params = {name: "Milton",
    * hobbies: "Listening to music from 9-11 at a reasonable volume"};
    * new IterableCollection(params).each(function(elem,key)
    * {
    *     console.log(key+": "+elem);
    * });
    */
    this.each = function(callback)
    {
        for(var key in this.obj)
            callback(this.obj[key],key);
    
        return this;
    }

    /**
    * Apply a callback to each item in this collection,
    * modifying this collection.
    *
    * Whatever is returned from the callback will 
    * replace the original object, keys are preserved.
    *
    * If the callback returns false, that key/element
    * pair will be removed.
    *
    * If you want to find an item in a collection 
    * without modifying the collection, use find()
    * instead of transform().
    * 
    * @memberof module:TrellinatorCore.IterableCollection
    * @param callback {Function} a call back that
    * accepts an element of this collection and
    * optionally a second argument which is the key
    * and returns an object to be included in the
    * modified collection, or false and that 
    * key/element pair will be removed
    * @example
    * notif.board().cards().transform(function(elem,key))
    * {
    *     if((key < 10) && (elem.name() == "ohai"))
    *         return elem;
    *     else
    *         return false;
    * }).first().postComment("Yep, ohai alright");
    */
    this.transform = function(callback)
    {
        this.obj = this.find(callback).obj;
        return this;
    }
    
    /**
    * Return the number of items in this collection
    * @memberof module:TrellinatorCore.IterableCollection
    */
    this.length = function()
    {
        return Object.keys(this.obj).length;
    }

    /**
    * Convenience function to find an object
    * by name() method, compared with a string
    * or RegExp, or object with a "name" 
    * parameter
    * @memberof module:TrellinatorCore.IterableCollection
    * @param expression {string|RegExp} the expression
    * to compare to the name of each element to find
    */
    this.findByName = function(expression)    
    {
        var ret = this;
      
        if(expression)
        {
            ret = this.find(function(elem)
            {
                if(TrelloApi.nameTest(TrelloApi.nameTestData(expression),elem.name()))
                    return elem;
                else
                    return false;
            });
        }
            
        return ret;
    }
    
    /**
    * Return the object as an Array, preserving
    * keys
    * @memberof module:TrellinatorCore.IterableCollection
    */
    this.asArray = function()
    {
      ret = new Array();
      
      for(var key in this.obj)
        ret[key] = this.obj[key];
      
      return ret;
    }

    //DEPRECATED
    this.clone = function()
    {
        var new_obj = [];

        for(var key in this.obj)
          new_obj[key] = this.obj[key];

        return new IterableCollection(new_obj);
    }
}
