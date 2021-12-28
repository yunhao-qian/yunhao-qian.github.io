---
title: 17 Amortized Analysis
---

Amortized analysis:

* A sequence of operations.
* Average cost in the worst case.
* No probability involved.

Techniques:

1. Aggregate analysis: $$T(n) / n$$, every operation has the same amortized cost.
2. Accounting method: each type of operation may have a different amortized cost.
3. Potential method: maintain an "potential energy" *as a hole* instead of credit with *individual objects* in the data structure.

## Aggregate analysis

A sequence of $$n$$ operations takes worst time $$T(n)$$.

$$\Rightarrow$$ Amortized cost per operation is $$T(n) / n$$, even if there are several types of operations in the sequence.

### Stack operations

`MULTIPOP(S, k)` pops `min(S.size, k)` elements from `S`.

A sequence of $$n$$ `PUSH`, `POP`, and `MULTIPOP` operations on an initially empty stack takes at most $$O(n)$$ time (because # elements popped $$\leq$$ # elements pushed). Therefore, all three operations have an amortized cost of $$O(1)$$.

### Incrementing a binary counter

$$A[0, \ldots, k - 1]$$ counts upward from 0.

With $$n$$ `INCREMENT` operations:

* `A[0]` flips $$n$$ times.
* `A[1]` flips $$\lfloor n / 2 \rfloor$$ times.
* `A[2]` flips $$\lfloor n / 4 \rfloor$$ times.
* ...

Total amortized cost:

$$
\sum_{i = 0}^{k - 1} \left\lfloor \frac{n}{2^i} \right\rfloor < 2 n = O(n) \text{.}
$$

Therefore, the amortized cost per operation is $$O(1)$$.

## The accounting method

Different charges to different operations. Then, amortized cost = amount we charge.

Credit:

* Amortized cost - actual cost.
* Associated with a specific object in the data structure.
* Must have $$\sum_{i = 1}^n \hat{c}_i \geq \sum_{i = 1}^n c_i$$, (amortized cost $$\geq$$ actual cost) for all sequences of $$n$$ operations.

### Stack operations

Actual cost of `PUSH`/`POP`: 1.

Amortized costs:

* `PUSH`: 2.

  1 actual cost, 1 credit.
* `POP`/`MULTIPOP`: 0.

  Charge nothing. Pay the actual cost using the 1 credit.

### Incrementing a binary counter

Charge an amortized cost of 2 to set a bit to 1:

* 1 actual cost.
* 1 credit, used when we flip the bit back to 0.

In an increment at most 1 bit is set to 1, so the amortized cost per operation is 2, and the total amortized cost is $$O(n)$$.

## The potential method

Potential: associated with the data structure as a whole, rather than specific objects within the data structure.

Potential function: $$\Phi(D_i)$$, where $$D_i$$ is the data structure, and $$\Phi(D_i) \in \mathbb{R}$$ is the potential.

* $$c_i$$: actual cost of the $$i$$'th operation.
* Amortized cost: $$\hat{c}_i = c_i + \Phi(D_i) - \Phi(D_{i - 1})$$.

Total amortized cost:

$$
\sum_{i = 1}^n \hat{c}_i = \left( \sum_{i = 1}^n c_i \right) + \Phi(D_n) - \Phi(D_0) \text{,}
$$

which is no less than the total actual cost $$\sum_{i = 1}^n c_i$$ as long as $$\Phi(D_i) \geq \Phi(D_0)$$ for all $$i$$.

### Stack operations

Potential function: number of elements in the stack. Because the initial potential is 0, and the potential is never negative, $$D_i > D_0$$ for all $$i$$.

Amortized cost:

* `PUSH`: 2.
* `POP`: 0.
* `MULTIPOP`: 0.

Therefore, the worst case cost for $$n$$ operations is $$O(n)$$.

### Incrementing a binary counter

Potential function: number of 1s in the counter.

In the $$i$$'th operation, $$t_i$$ bits are reset to zero, and the potential changes from $$b_{i - 1}$$ to $$b_i$$.

$$
\begin{cases}
    t_i = b_{i - 1} = k & \text{if } b_i = 0 \\
    b_i = b_{i - 1} - t_i + 1 & \text{if } b_i \neq 0
\end{cases}
$$

In both cases, $$b_i \leq b_{i - 1} - t_i + 1$$.

Because

* Potential difference: $$b_i - b_{i - 1} \leq 1 - t_i$$, and
* Actual cost $$\leq t_i + 1$$,

the amortized cost per operation is $$(1 - t_i) + (t_i + 1) = 2$$.

Note that the conclusion also applies if the counter does not start from 0.

$$
\sum_{i = 1}^n c_i \leq 2 n - b_n + b_0 \text{,}
$$

where $$0 \leq b_0, b_m \leq k$$. Therefore, as long as $$k = O(n)$$, the total actual cost is $$O(n)$$. In other words, the total actual cost is $$O(n)$$ if at least $$n = \Omega(k)$$ operations are executed.
