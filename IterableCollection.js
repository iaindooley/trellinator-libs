var IterableCollection = function(arr)
{
    this.arr = arr;

    this.each = function(callback)
    {
        for(i = 0;i < arr.length;i++)
            callback(arr[i]);
    }

    this.transform = function(callback)
    {
        for(i = 0;i < arr.length;i++)
            arr[i] = callback(arr[i]);
    }
    
    return this;
}
