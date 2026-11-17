// Build
// gcc main.c -o main

// Start
// ./main

#include <stdio.h>

int main()
{
    int n, m, i, j;
    int max[10][10], allocation[10][10], need[10][10];
    int available[10], work[10];
    int finish[10] = {0};
    int safeSequence[10];
    int count = 0, found;

    printf("Enter number of processes: ");
    scanf("%d", &n);

    printf("Enter number of resources: ");
    scanf("%d", &m);

    printf("\nEnter Max matrix:\n");
    for (i = 0; i < n; i++)
    {
        for (j = 0; j < m; j++)
        {
            scanf("%d", &max[i][j]);
        }
    }

    printf("\nEnter Allocation matrix:\n");
    for (i = 0; i < n; i++)
    {
        for (j = 0; j < m; j++)
        {
            scanf("%d", &allocation[i][j]);
        }
    }

    printf("\nEnter Available resources:\n");
    for (j = 0; j < m; j++)
    {
        scanf("%d", &available[j]);
        work[j] = available[j];
    }

    for (i = 0; i < n; i++)
    {
        for (j = 0; j < m; j++)
        {
            need[i][j] = max[i][j] - allocation[i][j];
        }
    }

    printf("\nNeed Matrix:\n");
    for (i = 0; i < n; i++)
    {
        for (j = 0; j < m; j++)
        {
            printf("%d\t", need[i][j]);
        }
        printf("\n");
    }

    while (count < n)
    {
        found = 0;

        for (i = 0; i < n; i++)
        {
            if (finish[i] == 0)
            {
                int canExecute = 1;

                for (j = 0; j < m; j++)
                {
                    if (need[i][j] > work[j])
                    {
                        canExecute = 0;
                        break;
                    }
                }

                if (canExecute)
                {
                    safeSequence[count] = i;
                    count++;

                    for (j = 0; j < m; j++)
                    {
                        work[j] += allocation[i][j];
                    }

                    finish[i] = 1;
                    found = 1;
                }
            }
        }

        if (found == 0)
        {
            break;
        }
    }

    if (count == n)
    {
        printf("\nSystem is in SAFE state.\n");
        printf("Safe Sequence: ");

        for (i = 0; i < n; i++)
        {
            printf("P%d", safeSequence[i]);

            if (i < n - 1)
            {
                printf(" -> ");
            }
        }

        printf("\n");
    }
    else
    {
        printf("\nSystem is NOT in SAFE state.\n");
    }

    return 0;
}