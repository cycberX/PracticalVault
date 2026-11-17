#include <stdio.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

void sorting(int arr[])
{
    int temp, min;

    for (int i = 0; i < 4; i++)
    {
        min = i;

        for (int j = i + 1; j < 5; j++)
        {
            if (arr[j] < arr[min])
                min = j;
        }

        temp = arr[i];
        arr[i] = arr[min];
        arr[min] = temp;
    }
}

void display(int arr[])
{
    printf("Array after sorting: ");

    for (int i = 0; i < 5; i++)
    {
        printf("%d ", arr[i]);
    }

    printf("\n");
}

int main()
{
    int forked;
    int arr[5];

    printf("Enter 5 array elements:\n");

    for (int i = 0; i < 5; i++)
    {
        printf("Enter element %d: ", i + 1);
        scanf("%d", &arr[i]);
    }

    printf("\nExperiment 2 is executing...\n");

    forked = fork();

    if (forked > 0)
    {
        wait(NULL);

        printf("\nParent process is executing\n");
        printf("Parent PID: %d\n", getpid());

        sorting(arr);
        display(arr);
    }
    else if (forked == 0)
    {
        printf("\nChild process is executing\n");
        printf("Child PID: %d\n", getpid());

        sorting(arr);
        display(arr);
    }
    else
    {
        printf("Unable to create process\n");
        return 1;
    }

    return 0;
}