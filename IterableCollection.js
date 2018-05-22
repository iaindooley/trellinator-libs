var IterableCollection = function(obj)
{
    this.obj = obj;

    this.hasMember = function(match)
    {
        var ret = false;

        for(var key in this.obj)
        {
            if(this.obj[key] === match)
                ret = true;
        }
        
        return ret;
    }

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
            if(!ret)
                ret = callback(this.obj[key],key);
            else
                ret += separator+callback(this.obj[key],key);
        }
        
        return ret;
    }

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
    
    this.itemAfter = function(expression)
    {
        var ret         = null;
        var return_next = false;
      
        if(expression)
        {
            for(var key in this.obj)
            {
                if(return_next)
                {
                    return_next = false;
                    ret = this.obj[key];
                }

                else if(TrelloApi.nameTest(expression,this.obj[key].name()))
                    return_next = true;
            }
        }
        
        if(!ret)
            throw new InvalidDataException("There was no item after: "+expression);
            
        return ret;
    }

    this.random = function()
    {
        if(!this.length())
            throw new InvalidDataException("No items in IterableCollection when selecting a random element");

        var keys = Object.keys(this.obj)
        return this.obj[keys[ keys.length * Math.random() << 0]];
    }

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

    this.each = function(callback)
    {
        for(var key in this.obj)
            callback(this.obj[key],key);
    
        return this;
    }

    this.transform = function(callback)
    {
        var new_obj = [];

        for(var key in this.obj)
        {
            if((transformed = callback(this.obj[key],key)) !== false)
                new_obj[key] = transformed;
        }

        this.obj = new_obj;
        return this;
    }
    
    this.length = function()
    {
        return Object.keys(this.obj).length;
    }

    this.findByName = function(expression)    
    {
        var ret = this;
      
        if(expression)
        {
            var new_obj = [];
            
            for(var key in this.obj)
            {
                if(TrelloApi.nameTest(expression,this.obj[key].name()))
                    new_obj[key] = this.obj[key];
            }
            
            ret = new IterableCollection(new_obj);
        }
            
        return ret;
    }
    
    this.filterByName = function(expression)
    {
        if(expression)
        {
            var new_obj = [];
            
            for(var key in this.obj)
            {
                if(TrelloApi.nameTest(expression,this.obj[key].name()))
                    new_obj[key] = this.obj[key];
            }
            
            this.obj = new_obj;
        }

        return this;
    }
    
    this.asArray = function()
    {
      ret = new Array();
      
      for(var key in this.obj)
        ret[key] = this.obj[key];
      
      return ret;
    }
}
