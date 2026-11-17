// Build
// gcc main.c -o main

// Start
// ./main

#include <stdio.h>
#include <stdlib.h>

#define MAX 100

int requests[MAX];
int n, head, disk_size;

int cmp(const void *a, const void *b)
{
    int x = *(const int *)a;
    int y = *(const int *)b;

    return (x > y) - (x < y);
}

void sstf()
{
    int visited[MAX] = {0};
    int cur = head, total = 0;

    printf("\n--- SSTF Scheduling ---\n");
    printf("Seek Sequence: %d", cur);

    for (int i = 0; i < n; i++)
    {
        int min_dist = 1000000, idx = -1;

        for (int j = 0; j < n; j++)
        {
            if (!visited[j])
            {
                int dist = abs(requests[j] - cur);

                if (dist < min_dist)
                {
                    min_dist = dist;
                    idx = j;
                }
            }
        }

        visited[idx] = 1;
        total += min_dist;
        cur = requests[idx];

        printf(" -> %d", cur);
    }

    printf("\nTotal Head Movement (SSTF) = %d\n", total);
}

void scan()
{
    int req[MAX], total = 0, cur = head;

    for (int i = 0; i < n; i++)
        req[i] = requests[i];

    qsort(req, n, sizeof(int), cmp);

    int idx = 0;

    while (idx < n && req[idx] < head)
        idx++;

    printf("\n--- SCAN Scheduling ---\n");
    printf("Seek Sequence: %d", cur);

    for (int i = idx; i < n; i++)
    {
        total += abs(req[i] - cur);
        cur = req[i];
        printf(" -> %d", cur);
    }

    if (cur != disk_size - 1)
    {
        total += abs((disk_size - 1) - cur);
        cur = disk_size - 1;
        printf(" -> %d (end)", cur);
    }

    for (int i = idx - 1; i >= 0; i--)
    {
        total += abs(req[i] - cur);
        cur = req[i];
        printf(" -> %d", cur);
    }

    printf("\nTotal Head Movement (SCAN) = %d\n", total);
}

void clook()
{
    int req[MAX], total = 0, cur = head;

    for (int i = 0; i < n; i++)
        req[i] = requests[i];

    qsort(req, n, sizeof(int), cmp);

    int idx = 0;

    while (idx < n && req[idx] < head)
        idx++;

    printf("\n--- C-LOOK Scheduling ---\n");
    printf("Seek Sequence: %d", cur);

    for (int i = idx; i < n; i++)
    {
        total += abs(req[i] - cur);
        cur = req[i];
        printf(" -> %d", cur);
    }

    if (idx > 0)
    {
        total += abs(req[0] - cur);
        cur = req[0];
        printf(" -> %d (jump)", cur);

        for (int i = 1; i < idx; i++)
        {
            total += abs(req[i] - cur);
            cur = req[i];
            printf(" -> %d", cur);
        }
    }

    printf("\nTotal Head Movement (C-LOOK) = %d\n", total);
}

int main()
{
    printf("Enter total number of disk tracks (disk size): ");
    scanf("%d", &disk_size);

    printf("Enter number of requests: ");
    scanf("%d", &n);

    if (disk_size < 1 || disk_size > 1000000 ||
        n < 1 || n > MAX)
    {
        printf("Invalid disk size or number of requests.\n");
        return 1;
    }

    printf("Enter the request sequence (track numbers): ");

    for (int i = 0; i < n; i++)
    {
        scanf("%d", &requests[i]);

        if (requests[i] < 0 || requests[i] >= disk_size)
        {
            printf("Invalid track number.\n");
            return 1;
        }
    }

    printf("Enter initial head position: ");
    scanf("%d", &head);

    if (head < 0 || head >= disk_size)
    {
        printf("Invalid head position.\n");
        return 1;
    }

    sstf();
    scan();
    clook();

    return 0;
}