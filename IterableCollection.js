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

    this.implode = function(separator,callback)
    {
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
                ret += "&"+key+"="+callback(this.obj[key],key);
        }
        
        return ret;
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
            throw new Error("No data in IterableCollection: "+this.obj);
        
        return ret;
    }

    this.each = function(callback)
    {
        for(var key in this.obj)
            callback(this.obj[key]);
    
        return this;
    }

    this.transform = function(callback)
    {
        for(var key in this.obj)
            this.obj[key] = callback(this.obj[key]);

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
}
