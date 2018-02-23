var IterableCollection = function(arr)
{
    this.arr = arr;

    this.each = function(callback)
    {
        for(i = 0;i < arr.length;i++)
        {
            callback(arr[i]);
        }
    }

    this.transform = function(callback)
    {
        for(i = 0;i < arr.length;i++)
        {
            arr[i] = callback(arr[i]);
        }
    }
    
    return this;
}

function doSomething(arg1)
{
    IterableCollection(Array("one","two","three")).each(function(arg)
    {
        console.log(arg1.one+" "+arg);
    });
}

var obj = {one: "One",two: "Two"};

doSomething(obj);
